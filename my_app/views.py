import json
import hashlib
import re
import uuid
from copy import deepcopy
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

from asgiref.sync import async_to_sync
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import UserCreationForm
from django.core.cache import cache
from django.http import JsonResponse
from django.db.utils import OperationalError, ProgrammingError
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.utils.text import get_valid_filename
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .forms import AccountSettingsForm
from .models import (
    DivisionStore,
    SharedDivisionStore,
    DivisionStoreEvent,
    ConstructionUpload,
    UserProfile,
    KEY_ADMIN,
    KEY_PLANNING,
    KEY_CONSTRUCTION,
    KEY_QUALITY,
    KEY_MAINTENANCE
)

try:
    from channels.layers import get_channel_layer
except ImportError:
    def get_channel_layer():
        return None


def _safe_log_division_store_event(
    *,
    actor,
    store_key,
    target,
    write_mode="",
    request_payload=None,
    stored_payload=None,
    path="",
    method="",
):
    try:
        DivisionStoreEvent.objects.create(
            actor=actor,
            store_key=store_key,
            target=target,
            write_mode=str(write_mode or ""),
            request_payload=request_payload,
            stored_payload=stored_payload,
            path=str(path or "")[:255],
            method=str(method or "")[:10],
        )
    except (OperationalError, ProgrammingError):
        return
    except Exception:
        return


def _broadcast_division_store_update(*, store_keys, actor=None, updated_at=None):
    keys = [str(key or "").strip() for key in (store_keys or []) if str(key or "").strip()]
    if not keys:
        return

    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            "division_store_updates",
            {
                "type": "store_update",
                "store_keys": keys,
                "updated_at": updated_at or timezone.now().isoformat(),
                "actor": actor.get_username() if actor and getattr(actor, "is_authenticated", False) else "",
            },
        )
    except Exception:
        return


def _get_user_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


def _normalize_division_key(value):
    text = str(value or "").strip().lower()
    if not text:
        return ""

    group_to_key = {
        "admin": KEY_ADMIN,
        "planning": KEY_PLANNING,
        "construction": KEY_CONSTRUCTION,
        "quality": KEY_QUALITY,
        "quality control": KEY_QUALITY,
        "maintenance": KEY_MAINTENANCE,
        "maitenance": KEY_MAINTENANCE,
    }
    if text in group_to_key:
        return group_to_key[text]

    label_to_key = {
        "admin division": KEY_ADMIN,
        "planning division": KEY_PLANNING,
        "construction division": KEY_CONSTRUCTION,
        "quality division": KEY_QUALITY,
        "quality control division": KEY_QUALITY,
        "maintenance division": KEY_MAINTENANCE,
    }

    if text in label_to_key:
        return label_to_key[text]
    if text in {KEY_ADMIN, KEY_PLANNING, KEY_CONSTRUCTION, KEY_QUALITY, KEY_MAINTENANCE}:
        return text

    return ""


def _is_empty_division_store_payload(store_key, payload):
    key = _normalize_division_key(store_key)
    if key == KEY_MAINTENANCE:
        if not isinstance(payload, dict):
            return True
        for list_key in (
            "roadRecords",
            "equipmentRows",
            "scheduleRows",
            "taskRows",
            "personnelRecords",
            "contractorRecords",
        ):
            if isinstance(payload.get(list_key), list) and payload.get(list_key):
                return False
        return True

    return not (isinstance(payload, list) and len(payload) > 0)


def _shared_store_should_bootstrap(store_key, shared_store):
    """
    Bootstrap SharedDivisionStore from legacy per-user DivisionStore only when the shared
    store is still uninitialized.

    If the shared store was explicitly written (including being cleared to empty), do not
    re-bootstrap; otherwise deleted data can reappear after refresh.
    """

    key = _normalize_division_key(store_key)
    if not key or not shared_store:
        return False

    if not _is_empty_division_store_payload(key, getattr(shared_store, "data", None)):
        return False

    try:
        has_events = DivisionStoreEvent.objects.filter(
            store_key=key,
            target=DivisionStoreEvent.TARGET_SHARED,
        ).exists()
        if has_events:
            return False
    except (OperationalError, ProgrammingError):
        # The events table might not exist yet; fall back to timestamps below.
        pass
    except Exception:
        pass

    try:
        created_at = getattr(shared_store, "created_at", None)
        updated_at = getattr(shared_store, "updated_at", None)
        if created_at and updated_at and (updated_at - created_at) > timedelta(seconds=2):
            return False
    except Exception:
        pass

    return True


def _division_label_for_key(value):
    key = _normalize_division_key(value)
    labels = {
        KEY_ADMIN: "Admin Division",
        KEY_PLANNING: "Planning Division",
        KEY_CONSTRUCTION: "Construction Division",
        KEY_QUALITY: "Quality Division",
        KEY_MAINTENANCE: "Maintenance Division",
    }
    return labels.get(key, "")


def _division_key_from_groups(user):
    try:
        group_names = {str(group.name or "").strip() for group in user.groups.all()}
    except Exception:
        return ""

    keys = {_normalize_division_key(name) for name in group_names}
    keys.discard("")
    if len(keys) == 1:
        return next(iter(keys))
    return ""


def _get_user_division_key(user):
    try:
        profile = user.profile
    except (AttributeError, UserProfile.DoesNotExist):
        profile = None

    group_key = _normalize_division_key(_division_key_from_groups(user))
    profile_key = _normalize_division_key(getattr(profile, "division", ""))

    if group_key and profile_key and group_key != profile_key:
        return ""

    return group_key or profile_key


def _store_write_mode(user, store_key):
    if user.is_superuser:
        return "full"

    user_division = _get_user_division_key(user)
    store_key = _normalize_division_key(store_key)
    if not user_division or not store_key:
        return ""

    if store_key == user_division:
        return "full"

    if store_key == KEY_ADMIN and user_division in {KEY_PLANNING, KEY_CONSTRUCTION, KEY_QUALITY, KEY_MAINTENANCE}:
        return "restricted_admin_submit"

    return ""


def _json_record_id(record):
    if not isinstance(record, dict):
        return ""
    return str(record.get("__record_id") or record.get("__id") or record.get("id") or "").strip()


def _enforce_admin_submit_payload(user_division, existing_data, incoming_data):
    """
    Non-admin divisions can write to the shared Admin store, but only for:
      - Creating new records they submit/rout to another division
      - Updating records currently assigned to their division (based on the record's `division` field)

    Deletions are not allowed for non-admin divisions (existing records are always preserved).
    """

    existing_records = existing_data if isinstance(existing_data, list) else []
    incoming_records = incoming_data if isinstance(incoming_data, list) else []

    def normalize_assigned_division(record):
        if not isinstance(record, dict):
            return ""
        return _normalize_division_key(record.get("division"))

    existing_by_id = {}
    for record in existing_records:
        record_id = _json_record_id(record)
        if record_id:
            existing_by_id[record_id] = record

    accepted_updates = {}
    accepted_new = []
    seen_ids = set()
    for record in incoming_records:
        if not isinstance(record, dict):
            continue

        record_id = _json_record_id(record) or uuid.uuid4().hex
        if record_id in seen_ids:
            continue
        seen_ids.add(record_id)

        if record_id in existing_by_id:
            existing = existing_by_id[record_id]
            existing_division = normalize_assigned_division(existing)
            if existing_division != user_division:
                continue

            next_record = dict(record)
            next_record["__record_id"] = record_id
            next_record["__submitted_from_division"] = user_division
            accepted_updates[record_id] = next_record
            continue

        next_record = dict(record)
        next_record["__record_id"] = record_id
        next_record["__submitted_from_division"] = user_division
        accepted_new.append(next_record)

    merged = []
    for record in existing_records:
        record_id = _json_record_id(record)
        if record_id and record_id in accepted_updates:
            merged.append(accepted_updates[record_id])
        else:
            merged.append(record)

    # Mirror the UI behavior that prepends newly submitted records.
    return accepted_new + merged


def _enforce_append_only_payload(existing_data, incoming_data):
    existing_records = existing_data if isinstance(existing_data, list) else []
    incoming_records = incoming_data if isinstance(incoming_data, list) else []

    existing_by_id = {}
    existing_ids = set()
    for record in existing_records:
        record_id = _json_record_id(record)
        if record_id:
            existing_by_id[record_id] = record
            existing_ids.add(record_id)

    new_records = []
    seen = set(existing_ids)
    for record in incoming_records:
        if not isinstance(record, dict):
            continue
        record_id = _json_record_id(record)
        if not record_id:
            record_id = uuid.uuid4().hex
        if record_id in seen:
            continue
        seen.add(record_id)
        next_record = dict(record)
        next_record["__record_id"] = record_id
        new_records.append(next_record)

    return new_records + existing_records


def _build_user_identity(user, profile=None):
    full_name = user.get_full_name().strip()
    display_name = full_name or user.get_username()
    name_parts = [part[0] for part in display_name.split() if part]
    if len(name_parts) >= 2:
        initials = ''.join(name_parts[:2]).upper()
    else:
        alnum_name = ''.join(char for char in display_name if char.isalnum())
        initials = (alnum_name[:2] or 'US').upper()

    if user.is_superuser:
        role_label = 'System Administrator'
    elif user.is_staff:
        role_label = 'Staff User'
    else:
        role_label = 'Portal User'

    if profile is None:
        profile = _get_user_profile(user)

    profile_dir = Path(__file__).resolve().parent / "static" / "profile"
    legacy_uploads_dir = Path(__file__).resolve().parent / "static" / "uploads"
    picture_url = ""

    def pick_static_picture(base_dir, url_prefix):
        if not base_dir.exists():
            return ""
        for ext in (".jpg", ".jpeg", ".png", ".webp"):
            candidate = base_dir / f"profile_{user.id}{ext}"
            if candidate.exists():
                # Add a cache buster so updates show immediately after upload.
                version = int(candidate.stat().st_mtime)
                return f"{url_prefix}/{candidate.name}?v={version}"
        return ""

    picture_url = pick_static_picture(profile_dir, "/static/profile") or pick_static_picture(legacy_uploads_dir, "/static/uploads")

    if not picture_url:
        picture_url = profile.profile_picture.url if profile.profile_picture else ''

    return {
        'dashboard_user_profile_picture_url': picture_url,
        'dashboard_user_name': display_name,
        'dashboard_user_initials': initials,
        'dashboard_user_role': role_label,
    }


def _format_notification_time(value, fallback='Recently updated'):
    if not value:
        return fallback

    current_time = timezone.localtime(timezone.now())
    local_value = timezone.localtime(value)
    delta = current_time - local_value

    if delta.total_seconds() < 60:
        return 'Just now'
    if delta.total_seconds() < 3600:
        minutes = max(int(delta.total_seconds() // 60), 1)
        return f'{minutes}m ago'
    if delta.total_seconds() < 86400:
        hours = max(int(delta.total_seconds() // 3600), 1)
        return f'{hours}h ago'
    if delta.days < 7:
        return f'{delta.days}d ago'

    return local_value.strftime('%b %d, %Y')


def _normalize_status_key(value):
    text = str(value or '').strip().lower()
    if not text:
        return ''
    return re.sub(r'[^a-z0-9]+', '_', text).strip('_')


def _parse_percent(value):
    if value is None:
        return None

    if isinstance(value, (int, float)):
        numeric = float(value)
        if not (numeric == numeric):  # NaN guard
            return None
        if 0 <= numeric <= 1:
            return max(0.0, min(100.0, numeric * 100.0))
        return max(0.0, min(100.0, numeric))

    text = str(value).strip()
    if not text:
        return None

    match = re.search(r'(-?\d+(\.\d+)?)', text.replace(',', ''))
    if not match:
        return None
    try:
        numeric = float(match.group(1))
    except ValueError:
        return None

    # Heuristic: treat 0-1 as fraction if no explicit percent sign.
    if '%' not in text and 0 <= numeric <= 1:
        numeric *= 100.0

    return max(0.0, min(100.0, numeric))


def _parse_loose_datetime(value):
    if not value:
        return None

    if isinstance(value, datetime):
        return value

    text = str(value).strip()
    if not text:
        return None

    # Prefer ISO-ish parsing first.
    try:
        normalized = text.replace("Z", "+00:00") if text.endswith("Z") else text
        return datetime.fromisoformat(normalized)
    except ValueError:
        pass

    patterns = (
        '%Y-%m-%d',
        '%Y-%m-%d %H:%M',
        '%Y-%m-%d %H:%M:%S',
        '%m/%d/%Y %H:%M',
        '%m/%d/%Y %I:%M %p',
        '%m/%d/%Y',
        '%d/%m/%Y',
        '%b %d, %Y',
        '%B %d, %Y',
    )
    for pattern in patterns:
        try:
            return datetime.strptime(text, pattern)
        except ValueError:
            continue

    return None


def _safe_list(value):
    return value if isinstance(value, list) else []


_CACHE_VERSION_KEY = "my_app:store_cache_version"
_STORE_KEYS = (
    KEY_ADMIN,
    KEY_PLANNING,
    KEY_CONSTRUCTION,
    KEY_QUALITY,
    KEY_MAINTENANCE,
)


def _settings_int(name, default):
    try:
        return int(getattr(settings, name, default))
    except (TypeError, ValueError):
        return default


_SYSTEM_DATA_CACHE_TTL = _settings_int("SYSTEM_DATA_CACHE_TTL_SECONDS", 300)
_SYSTEM_COMPUTED_CACHE_TTL = _settings_int("SYSTEM_COMPUTED_CACHE_TTL_SECONDS", 120)


def _cache_key(namespace, *parts):
    raw = "|".join(str(part or "") for part in parts)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"my_app:{namespace}:{digest}"


def _cache_get_or_set(cache_key_value, builder, timeout):
    cached = cache.get(cache_key_value)
    if cached is not None:
        return deepcopy(cached)

    computed = builder()
    cache.set(cache_key_value, computed, timeout)
    return deepcopy(computed)


def _get_store_cache_version():
    version = cache.get(_CACHE_VERSION_KEY)
    if version:
        return str(version)

    version = uuid.uuid4().hex
    cache.set(_CACHE_VERSION_KEY, version, None)
    return version


def _invalidate_store_cache():
    cache.set(_CACHE_VERSION_KEY, uuid.uuid4().hex, None)


def _store_default_data(key):
    return {} if key == KEY_MAINTENANCE else []


def _normalize_store_data(key, data):
    if key == KEY_MAINTENANCE:
        return data if isinstance(data, dict) else {}
    return data if isinstance(data, list) else []


def _empty_store_snapshot():
    return {
        key: {
            "data": _store_default_data(key),
            "updated_at": None,
        }
        for key in _STORE_KEYS
    }


def _snapshot_to_store_map(snapshot):
    stores = {}
    for key in _STORE_KEYS:
        snapshot_item = snapshot.get(key) if isinstance(snapshot, dict) else None
        snapshot_item = snapshot_item if isinstance(snapshot_item, dict) else {}
        updated_at_raw = snapshot_item.get("updated_at")
        updated_at = _parse_loose_datetime(updated_at_raw)
        stores[key] = SimpleNamespace(
            key=key,
            data=_normalize_store_data(key, snapshot_item.get("data")),
            updated_at=updated_at,
        )
    return stores


def _build_shared_store_snapshot():
    snapshot = _empty_store_snapshot()
    stores = SharedDivisionStore.objects.filter(key__in=_STORE_KEYS)
    for store in stores:
        snapshot[store.key] = {
            "data": _normalize_store_data(store.key, store.data),
            "updated_at": store.updated_at.isoformat() if store.updated_at else None,
        }
    return snapshot


def _build_user_store_snapshot(user):
    snapshot = _empty_store_snapshot()
    stores = DivisionStore.objects.filter(user=user, key__in=_STORE_KEYS)
    for store in stores:
        snapshot[store.key] = {
            "data": _normalize_store_data(store.key, store.data),
            "updated_at": store.updated_at.isoformat() if store.updated_at else None,
        }
    return snapshot


def _load_shared_stores(user=None):
    version = _get_store_cache_version()
    shared_cache_key = _cache_key("stores", "shared", version)
    try:
        shared_snapshot = _cache_get_or_set(
            shared_cache_key,
            _build_shared_store_snapshot,
            timeout=_SYSTEM_DATA_CACHE_TTL,
        )
        return _snapshot_to_store_map(shared_snapshot)
    except (OperationalError, ProgrammingError):
        if user is None:
            return _snapshot_to_store_map(_empty_store_snapshot())

    user_id = getattr(user, "pk", None)
    user_cache_key = _cache_key("stores", "user", user_id or "anon", version)
    user_snapshot = _cache_get_or_set(
        user_cache_key,
        lambda: _build_user_store_snapshot(user),
        timeout=_SYSTEM_DATA_CACHE_TTL,
    )
    return _snapshot_to_store_map(user_snapshot)


def _build_overview_context(user):
    stores = _load_shared_stores(user)

    admin_records = _safe_list(stores.get(KEY_ADMIN).data if stores.get(KEY_ADMIN) else [])
    planning_records = _safe_list(stores.get(KEY_PLANNING).data if stores.get(KEY_PLANNING) else [])
    construction_records = _safe_list(stores.get(KEY_CONSTRUCTION).data if stores.get(KEY_CONSTRUCTION) else [])
    quality_records = _safe_list(stores.get(KEY_QUALITY).data if stores.get(KEY_QUALITY) else [])
    maintenance_payload = stores.get(KEY_MAINTENANCE).data if stores.get(KEY_MAINTENANCE) else {}
    maintenance_payload = maintenance_payload if isinstance(maintenance_payload, dict) else {}

    def count_payload_records(payload):
        if isinstance(payload, list):
            return len([r for r in payload if isinstance(r, dict)])

        if isinstance(payload, dict):
            counts = 0
            for key in ('roadRecords', 'equipmentRows', 'scheduleRows', 'taskRows', 'personnelRecords', 'contractorRecords'):
                value = payload.get(key)
                if isinstance(value, list):
                    counts += len(value)
            return counts

        return 0

    def is_approved_status(status_value):
        key = _normalize_status_key(status_value)
        return key in {'approved', 'closed', 'completed', 'received'}

    def record_status(record):
        if not isinstance(record, dict):
            return ''
        return record.get('billing_status') or record.get('doc_status') or record.get('status') or ''

    admin_total = len([r for r in admin_records if isinstance(r, dict)])
    admin_approved = sum(1 for r in admin_records if is_approved_status(record_status(r)))
    admin_pending = admin_total - admin_approved

    planning_total = len([r for r in planning_records if isinstance(r, dict)])
    planning_approved = sum(1 for r in planning_records if is_approved_status(record_status(r)))

    quality_total = len([r for r in quality_records if isinstance(r, dict)])
    quality_approved = sum(1 for r in quality_records if is_approved_status(record_status(r)))

    maintenance_total = count_payload_records(maintenance_payload)
    maintenance_tasks = maintenance_payload.get('taskRows') if isinstance(maintenance_payload.get('taskRows'), list) else []
    maintenance_task_total = len(maintenance_tasks)
    maintenance_task_completed = sum(
        1
        for task in maintenance_tasks
        if isinstance(task, dict) and _normalize_status_key(task.get('status')) in {'completed', 'closed', 'done', 'approved'}
    )
    maintenance_schedules = maintenance_payload.get('scheduleRows') if isinstance(maintenance_payload.get('scheduleRows'), list) else []
    maintenance_schedule_total = len(maintenance_schedules)
    maintenance_schedule_completed = sum(
        1
        for record in maintenance_schedules
        if isinstance(record, dict) and _normalize_status_key(record.get('status')) in {'completed', 'closed', 'done', 'finished'}
    )

    maintenance_equipment = maintenance_payload.get('equipmentRows') if isinstance(maintenance_payload.get('equipmentRows'), list) else []
    maintenance_roads = maintenance_payload.get('roadRecords') if isinstance(maintenance_payload.get('roadRecords'), list) else []

    def _maintenance_score_from_condition(value):
        key = _normalize_status_key(value).replace('_', ' ')
        if 'good' in key:
            return 100
        if 'fair' in key:
            return 70
        if 'poor' in key:
            return 40
        if 'bad' in key:
            return 10
        return 0

    def _maintenance_score_from_equipment_status(value):
        key = _normalize_status_key(value).replace('_', ' ')
        if any(token in key for token in ('operational', 'available', 'active', 'serviceable', 'ready')):
            return 100
        if any(token in key for token in ('maintenance', 'repair', 'inactive')):
            return 30
        if any(token in key for token in ('down', 'broken', 'unserviceable')):
            return 0
        return 60

    def _weighted_mean(pairs):
        numerator = 0.0
        denominator = 0.0
        for score, weight in pairs:
            if weight <= 0:
                continue
            numerator += float(score) * float(weight)
            denominator += float(weight)
        if not denominator:
            return 0
        return int(round(max(0.0, min(100.0, numerator / denominator))))

    maintenance_road_score = 0
    if maintenance_roads:
        maintenance_road_score = int(round(sum(_maintenance_score_from_condition(r.get('condition')) for r in maintenance_roads if isinstance(r, dict)) / float(len(maintenance_roads))))
        maintenance_road_score = max(0, min(100, maintenance_road_score))

    maintenance_equipment_score = 0
    if maintenance_equipment:
        maintenance_equipment_score = int(round(sum(_maintenance_score_from_equipment_status(r.get('status')) for r in maintenance_equipment if isinstance(r, dict)) / float(len(maintenance_equipment))))
        maintenance_equipment_score = max(0, min(100, maintenance_equipment_score))

    def is_construction_completed(record):
        if not isinstance(record, dict):
            return False
        status_current = record.get('status_current') or ''
        percent = _parse_percent(status_current)
        if percent is not None and percent >= 99.5:
            return True
        if str(record.get('date_completed') or '').strip():
            return True
        if 'complete' in str(status_current).lower():
            return True
        return False

    def construction_percent(record):
        if not isinstance(record, dict):
            return 0.0
        if is_construction_completed(record):
            return 100.0
        percent = _parse_percent(record.get('status_current'))
        return float(percent) if percent is not None else 0.0

    construction_named = [r for r in construction_records if isinstance(r, dict) and str(r.get('project_name') or '').strip()]
    construction_total = len(construction_named)
    construction_completed = sum(1 for r in construction_named if is_construction_completed(r))
    construction_active = construction_total - construction_completed

    def project_label_from_record(record, keys):
        if not isinstance(record, dict):
            return ''
        for key in keys:
            value = str(record.get(key) or '').strip()
            if value:
                return value
        return ''

    project_names_total = set()
    project_names_active = set()

    for record in admin_records:
        label = project_label_from_record(record, ('document_name', 'project_name'))
        if not label:
            continue
        project_names_total.add(label)
        if not is_approved_status(record_status(record)):
            project_names_active.add(label)

    for record in planning_records:
        label = project_label_from_record(record, ('document_name', 'project_name'))
        if not label:
            continue
        project_names_total.add(label)
        if not is_approved_status(record_status(record)):
            project_names_active.add(label)

    for record in construction_named:
        label = project_label_from_record(record, ('project_name',))
        if not label:
            continue
        project_names_total.add(label)
        if not is_construction_completed(record):
            project_names_active.add(label)

    def ratio_to_percent(numerator, denominator):
        if not denominator:
            return 0
        return int(round(max(0.0, min(100.0, (numerator / float(denominator)) * 100.0))))

    # Status cards
    total_projects = len(project_names_total)
    active_projects = len(project_names_active)
    overview_active_projects_progress = ratio_to_percent(active_projects, total_projects)

    pending_approvals = admin_pending + (planning_total - planning_approved) + (quality_total - quality_approved)
    pending_approvals_denominator = admin_total + planning_total + quality_total
    overview_pending_approvals_progress = ratio_to_percent(pending_approvals, pending_approvals_denominator)

    total_records = admin_total + planning_total + construction_total + quality_total + maintenance_total
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    recent_updates = 0
    for store in stores.values():
        if store.updated_at and store.updated_at >= week_ago:
            recent_updates += count_payload_records(store.data)

    overview_recent_updates_progress = ratio_to_percent(recent_updates, total_records)

    # Spotlight (completed construction projects)
    completed_projects = []
    for record in construction_named:
        if not is_construction_completed(record):
            continue
        title = str(record.get('project_name') or '').strip()
        if not title:
            continue
        record_id = str(record.get('__id') or '').strip()
        completed_at = (
            _parse_loose_datetime(record.get('date_completed'))
            or _parse_loose_datetime(record.get('revised_expiry_date'))
            or _parse_loose_datetime(record.get('original_expiry_date'))
        )
        location = str(record.get('location') or '').strip()
        contractor = str(record.get('contractor') or '').strip()
        subtitle_bits = [bit for bit in (location, contractor) if bit]
        subtitle = ' • '.join(subtitle_bits)
        completed_projects.append(
            {
                'id': record_id,
                'category': 'Construction',
                'title': title,
                'subtitle': subtitle,
                '__sort': completed_at.timestamp() if completed_at else 0,
            }
        )

    completed_projects.sort(key=lambda item: item.get('__sort', 0), reverse=True)
    spotlight_projects = [
        {k: v for k, v in item.items() if not k.startswith('__')}
        for item in completed_projects
    ]

    # Recent activity (division store syncs)
    activity_entries = []
    dot_class_for = {
        KEY_ADMIN: 'dot-blue',
        KEY_PLANNING: 'dot-amber',
        KEY_CONSTRUCTION: 'dot-green',
        KEY_QUALITY: 'dot-slate',
        KEY_MAINTENANCE: 'dot-blue',
    }
    label_for = {
        KEY_ADMIN: 'Admin Division',
        KEY_PLANNING: 'Planning Division',
        KEY_CONSTRUCTION: 'Construction Division',
        KEY_QUALITY: 'Quality Division',
        KEY_MAINTENANCE: 'Maintenance Division',
    }

    min_sort_time = now - timedelta(days=36500)
    for key in (
        KEY_PLANNING,
        KEY_QUALITY,
        KEY_CONSTRUCTION,
        KEY_ADMIN,
        KEY_MAINTENANCE,
    ):
        store = stores.get(key)
        payload = store.data if store else ([] if key != KEY_MAINTENANCE else {})
        record_count = count_payload_records(payload)
        activity_entries.append(
            (
                (store.updated_at if store and store.updated_at else min_sort_time),
                {
                    'dot_class': dot_class_for.get(key, 'dot-slate'),
                    'title': f'{label_for.get(key, key.title())} synced',
                    'meta': _format_notification_time(store.updated_at if store else None, fallback='Not synced yet'),
                    'note': f'{record_count} record{"s" if record_count != 1 else ""}',
                },
            )
        )

    activity_entries.sort(key=lambda entry: entry[0], reverse=True)
    recent_activity = [entry[1] for entry in activity_entries[:5]]

    # Division completion metrics
    def completion_from_counts(done, total):
        return ratio_to_percent(done, total)

    admin_completion = completion_from_counts(admin_approved, admin_total)
    planning_completion = completion_from_counts(planning_approved, planning_total)
    quality_completion = completion_from_counts(quality_approved, quality_total)
    maintenance_work_items_total = maintenance_task_total + maintenance_schedule_total
    maintenance_work_items_completed = maintenance_task_completed + maintenance_schedule_completed
    maintenance_work_completion = completion_from_counts(maintenance_work_items_completed, maintenance_work_items_total) if maintenance_work_items_total else 0

    maintenance_completion = _weighted_mean([
        (maintenance_work_completion, maintenance_work_items_total),
        (maintenance_road_score, len(maintenance_roads)),
        (maintenance_equipment_score, len(maintenance_equipment)),
    ])
    construction_completion = 0
    if construction_total:
        construction_completion = int(round(sum(construction_percent(r) for r in construction_named) / float(construction_total)))
        construction_completion = max(0, min(100, construction_completion))

    division_completions = [
        ('Admin', admin_completion, 'admin_panel_settings', 'progress-blue'),
        ('Planning', planning_completion, 'architecture', 'progress-amber'),
        ('Construction', construction_completion, 'construction', 'progress-green'),
        ('Quality', quality_completion, 'verified', 'progress-blue'),
        ('Maintenance', maintenance_completion, 'build', 'progress-blue'),
    ]

    def status_for_completion(completion):
        if completion >= 90:
            return ('On track', 'pill-green')
        if completion >= 60:
            return ('In progress', 'pill-blue')
        if completion > 0:
            return ('Needs attention', 'pill-amber')
        return ('No data', 'pill-slate')

    division_progress_rows = []
    for name, completion, icon, progress_class in division_completions:
        status_label, status_class = status_for_completion(completion)
        store_key = {
            'Admin':KEY_ADMIN,
            'Planning': KEY_PLANNING,
            'Construction': KEY_CONSTRUCTION,
            'Quality': KEY_QUALITY,
            'Maintenance': KEY_MAINTENANCE,
        }.get(name)
        store = stores.get(store_key) if store_key else None
        last_synced = _format_notification_time(store.updated_at, fallback='Not synced yet') if store else 'Not synced yet'

        if name == 'Admin':
            meta = f'{admin_total} record{"s" if admin_total != 1 else ""}'
        elif name == 'Planning':
            meta = f'{planning_total} record{"s" if planning_total != 1 else ""}'
        elif name == 'Construction':
            meta = f'{construction_total} project{"s" if construction_total != 1 else ""}'
        elif name == 'Quality':
            meta = f'{quality_total} record{"s" if quality_total != 1 else ""}'
        else:
            meta = (
                f'{maintenance_work_items_total} work item{"s" if maintenance_work_items_total != 1 else ""}'
                if maintenance_work_items_total
                else f'{maintenance_total} item{"s" if maintenance_total != 1 else ""}'
            )

        division_progress_rows.append(
            {
                'division': name,
                'manager': '—',
                'completion': completion,
                'icon': icon,
                'progress_class': progress_class,
                'status': status_label,
                'status_class': status_class,
                'meta': meta,
                'last_synced': last_synced,
            }
        )

    performance_metrics = [
        {'label': name, 'target': 90, 'actual': completion}
        for name, completion, _icon, _progress_class in division_completions
    ]

    top_division = max(division_completions, key=lambda row: row[1])[0] if division_completions else ''
    avg_efficiency = int(round(sum(row[1] for row in division_completions) / float(len(division_completions)))) if division_completions else 0

    # Leadership org chart (static profile photos matched by filename).
    # Note: we match by name-to-filename only (no face recognition).
    from pathlib import Path

    from django.templatetags.static import static

    profiles_dir = Path(__file__).resolve().parent / 'static' / 'gov. profiles'

    def _normalize_name(value):
        raw = str(value or '').strip()
        tokens = [''.join(ch for ch in part.lower() if ch.isalnum()) for part in raw.split()]
        tokens = [t for t in tokens if t]

        # Strip common honorifics/role prefixes so display text can include them.
        while tokens and tokens[0] in {'hon', 'honorable', 'engr', 'eng'}:
            tokens.pop(0)

        return ''.join(tokens)

    def _build_initials(value):
        parts = [p for p in str(value or '').replace('.', ' ').split() if p.strip()]
        letters = [p[0].upper() for p in parts if p and p[0].isalpha()]
        return ''.join(letters[:2]) if letters else '--'

    def _photo_url_for_name(display_name):
        wanted = _normalize_name(display_name)
        if not wanted or not profiles_dir.exists():
            return ''

        for ext in ('.png', '.jpg', '.jpeg', '.webp'):
            candidate = profiles_dir / f'{display_name}{ext}'
            if candidate.exists():
                return static(f'gov. profiles/{candidate.name}')

        for path in profiles_dir.glob('*'):
            if not path.is_file() or path.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
                continue
            if _normalize_name(path.stem) == wanted:
                return static(f'gov. profiles/{path.name}')

        return ''

    def _leader_profile(name, title, tag=''):
        return {
            'name': name,
            'title': title,
            'tag': tag,
            'initials': _build_initials(name),
            'photo_url': _photo_url_for_name(name),
        }

    def _division_leader(department, name, title='Division Head', avatar_class=''):
        payload = _leader_profile(name=name, title=title, tag='')
        payload.update({'department': department, 'avatar_class': avatar_class})
        return payload

    leadership_executive = _leader_profile(
        name='Hon. Amy Roa Alvarez',
        title='Governor',
        tag='Executive Office',
    )
    leadership_under_executive = _leader_profile(
        name='Aireen C. Laguisma',
        title='Provincial Engineer',
        tag='Provincial Engineer Office',
    )
    leadership_assistants = [
        _leader_profile(name='Elmon Ray M. Juratil', title='Assistant Provincial Engineer', tag='Assistant Provincial Engineer'),
        _leader_profile(name='Ranford T. Villegas', title='Assistant Provincial Engineer', tag='Assistant Provincial Engineer'),
    ]
    leadership_divisions = [
        _division_leader('Administrative Division', 'Pearl Angelie L. Prado', avatar_class='leader-avatar-admin'),
        _division_leader('Planning Division', 'Arlene N. Gamo', avatar_class='leader-avatar-planning'),
        _division_leader('Construction Division', 'Elmon Ray M. Juratil', avatar_class='leader-avatar-construction'),
        _division_leader('Maintenance Division', 'Glenn J. Cayapas', avatar_class='leader-avatar-maintenance'),
        _division_leader('Quality Control Division', 'Charisma Wy B. Proells', avatar_class='leader-avatar-quality'),
    ]

    return {
        'overview_active_projects': active_projects,
        'overview_active_projects_delta': '',
        'overview_active_projects_progress': overview_active_projects_progress,
        'overview_pending_approvals': pending_approvals,
        'overview_pending_approvals_delta': '',
        'overview_pending_approvals_progress': overview_pending_approvals_progress,
        'overview_recent_updates': recent_updates,
        'overview_recent_updates_delta': '',
        'overview_recent_updates_progress': overview_recent_updates_progress,
        'overview_spotlight_projects': spotlight_projects,
        'overview_leadership_executive': leadership_executive,
        'overview_leadership_under_executive': leadership_under_executive,
        'overview_leadership_assistants': leadership_assistants,
        'overview_leadership_divisions': leadership_divisions,
        'overview_recent_activity': recent_activity,
        'overview_division_performance': performance_metrics,
        'overview_top_performer': top_division,
        'overview_overall_efficiency': f'{avg_efficiency}%',
        'overview_division_progress': division_progress_rows,
    }


_build_overview_context_uncached = _build_overview_context


def _build_overview_context(user):
    cache_key_value = _cache_key(
        "overview",
        _get_store_cache_version(),
        getattr(user, "pk", "anon"),
    )
    return _cache_get_or_set(
        cache_key_value,
        lambda: _build_overview_context_uncached(user),
        timeout=_SYSTEM_COMPUTED_CACHE_TTL,
    )


def _build_tracking_rows(user):
    def load_stores():
        stores = _load_shared_stores(user)

        admin_records = _safe_list(stores.get(KEY_ADMIN).data if stores.get(KEY_ADMIN) else [])
        planning_records = _safe_list(
            stores.get(KEY_PLANNING).data if stores.get(KEY_PLANNING) else []
        )
        construction_records = _safe_list(
            stores.get(KEY_CONSTRUCTION).data if stores.get(KEY_CONSTRUCTION) else []
        )
        quality_records = _safe_list(stores.get(KEY_QUALITY).data if stores.get(KEY_QUALITY) else [])
        maintenance_payload = stores.get(KEY_MAINTENANCE).data if stores.get(KEY_MAINTENANCE) else {}
        maintenance_payload = maintenance_payload if isinstance(maintenance_payload, dict) else {}
        return admin_records, planning_records, construction_records, quality_records, maintenance_payload

    admin_records, planning_records, construction_records, quality_records, maintenance_payload = load_stores()

    def normalize_label(value, fallback='—'):
        text = str(value or '').strip()
        return text if text else fallback

    def normalize_division(value):
        raw = str(value or '').strip()
        key = _normalize_status_key(raw).replace('_', ' ')
        if not key:
            return '—'
        if 'admin' in key:
            return 'Admin'
        if 'planning' in key:
            return 'Planning'
        if 'construction' in key:
            return 'Construction'
        if 'quality' in key:
            return 'Quality'
        if 'maintenance' in key:
            return 'Maintenance'
        return raw

    def linked_admin_id(source_record):
        if not isinstance(source_record, dict):
            return ''
        return str(
            source_record.get('__admin_source_id')
            or source_record.get('__admin_submission_id')
            or source_record.get('__admin_record_id')
            or source_record.get('adminRecordId')
            or ''
        ).strip()

    planning_by_admin_id = {}
    for record in planning_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        planning_by_admin_id[source_id] = record

    construction_by_admin_id = {}
    for record in construction_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        construction_by_admin_id[source_id] = record

    quality_by_admin_id = {}
    for record in quality_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        quality_by_admin_id[source_id] = record

    maintenance_tasks = maintenance_payload.get('taskRows') if isinstance(maintenance_payload.get('taskRows'), list) else []
    maintenance_by_admin_id = {}
    for task in maintenance_tasks:
        if not isinstance(task, dict):
            continue
        source_id = str(task.get('adminRecordId') or '').strip()
        if not source_id:
            continue
        maintenance_by_admin_id.setdefault(source_id, []).append(task)

    def admin_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('doc_status') or record.get('status'))

    def planning_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('status'))

    def quality_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('status'))

    def construction_status(record):
        if not isinstance(record, dict):
            return '—'
        if str(record.get('date_completed') or '').strip():
            return 'Completed'
        percent = _parse_percent(record.get('status_current'))
        if percent is not None:
            if percent >= 99.5:
                return 'Completed'
            return f'{int(round(percent))}%'
        status_text = str(record.get('status_current') or '').strip()
        if 'complete' in status_text.lower():
            return 'Completed'
        return normalize_label(status_text)

    def maintenance_status(tasks):
        if not tasks:
            return '—'
        normalized = [_normalize_status_key(t.get('status')) for t in tasks if isinstance(t, dict)]
        if any(value in {'completed', 'closed', 'done', 'approved'} for value in normalized):
            return 'Completed'
        if any(value in {'in_progress', 'processing', 'ongoing', 'active'} for value in normalized):
            return 'In Progress'
        if any(value in {'pending', 'incoming', 'scheduled'} for value in normalized):
            return 'Pending'
        first = next((t for t in tasks if isinstance(t, dict) and str(t.get('status') or '').strip()), None)
        return normalize_label(first.get('status') if first else '—')

    rows = []
    for record in admin_records:
        if not isinstance(record, dict):
            continue

        admin_id = str(record.get('__record_id') or '').strip()
        if not admin_id:
            continue

        planning_record = planning_by_admin_id.get(admin_id)
        construction_record = construction_by_admin_id.get(admin_id)
        quality_record = quality_by_admin_id.get(admin_id)
        maintenance_tasks_for_record = maintenance_by_admin_id.get(admin_id, [])

        routed_to = normalize_division(record.get('division'))
        rows.append(
            {
                'admin_record_id': admin_id,
                'slip_no': normalize_label(record.get('slip_no')),
                'project_name': normalize_label(record.get('document_name') or record.get('project_name')),
                'location': normalize_label(record.get('location')),
                'contractor': normalize_label(record.get('contractor')),
                'routed_to': routed_to,
                'admin_status': admin_status(record),
                'planning_status': planning_status(planning_record),
                'construction_status': construction_status(construction_record),
                'quality_status': quality_status(quality_record),
                'maintenance_status': maintenance_status(maintenance_tasks_for_record),
            }
        )

    # Sort by slip no (numeric-aware), fallback to project name.
    rows.sort(key=lambda item: (str(item.get('slip_no') or ''), str(item.get('project_name') or '')))
    return rows


def _build_tracking_payload(user):
    stores = _load_shared_stores(user)

    admin_records = _safe_list(stores.get(KEY_ADMIN).data if stores.get(KEY_ADMIN) else [])
    planning_records = _safe_list(stores.get(KEY_PLANNING).data if stores.get(KEY_PLANNING) else [])
    construction_records = _safe_list(stores.get(KEY_CONSTRUCTION).data if stores.get(KEY_CONSTRUCTION) else [])
    quality_records = _safe_list(stores.get(KEY_QUALITY).data if stores.get(KEY_QUALITY) else [])
    maintenance_payload = stores.get(KEY_MAINTENANCE).data if stores.get(KEY_MAINTENANCE) else {}
    maintenance_payload = maintenance_payload if isinstance(maintenance_payload, dict) else {}

    def normalize_label(value, fallback='—'):
        text = str(value or '').strip()
        return text if text else fallback

    def normalize_division(value):
        raw = str(value or '').strip()
        key = _normalize_status_key(raw).replace('_', ' ')
        if not key:
            return '—'
        if 'admin' in key:
            return 'Admin'
        if 'planning' in key:
            return 'Planning'
        if 'construction' in key:
            return 'Construction'
        if 'quality' in key:
            return 'Quality'
        if 'maintenance' in key:
            return 'Maintenance'
        return raw

    def pick_first(obj, *keys):
        if not isinstance(obj, dict):
            return ''
        for key in keys:
            value = obj.get(key)
            if value is None:
                continue
            text = str(value).strip()
            if text:
                return text
        return ''

    def normalize_event(ev):
        if not isinstance(ev, dict):
            return None
        at = str(ev.get('at') or ev.get('timestamp') or ev.get('date') or '').strip()
        action = str(ev.get('action') or '').strip() or 'Update'
        from_div = str(ev.get('from') or ev.get('from_division') or '').strip()
        to_div = str(ev.get('to') or ev.get('to_division') or '').strip()
        by_div = str(ev.get('by') or ev.get('submitted_by') or '').strip()
        note = str(ev.get('note') or ev.get('message') or '').strip()
        return {
            'at': at,
            'action': action,
            'from': from_div,
            'to': to_div,
            'by': by_div,
            'note': note,
        }

    def linked_admin_id(source_record):
        if not isinstance(source_record, dict):
            return ''
        return str(
            source_record.get('__admin_source_id')
            or source_record.get('__admin_submission_id')
            or source_record.get('__admin_record_id')
            or source_record.get('adminRecordId')
            or ''
        ).strip()

    planning_by_admin_id = {}
    for record in planning_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        planning_by_admin_id[source_id] = record

    construction_by_admin_id = {}
    for record in construction_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        construction_by_admin_id[source_id] = record

    quality_by_admin_id = {}
    for record in quality_records:
        if not isinstance(record, dict):
            continue
        source_id = linked_admin_id(record)
        if not source_id:
            continue
        quality_by_admin_id[source_id] = record

    maintenance_tasks = maintenance_payload.get('taskRows') if isinstance(maintenance_payload.get('taskRows'), list) else []
    maintenance_by_admin_id = {}
    for task in maintenance_tasks:
        if not isinstance(task, dict):
            continue
        source_id = str(task.get('adminRecordId') or '').strip()
        if not source_id:
            continue
        maintenance_by_admin_id.setdefault(source_id, []).append(task)

    def admin_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('doc_status') or record.get('status'))

    def planning_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('status'))

    def quality_status(record):
        if not isinstance(record, dict):
            return '—'
        return normalize_label(record.get('status'))

    def construction_status(record):
        if not isinstance(record, dict):
            return '—'
        if str(record.get('date_completed') or '').strip():
            return 'Completed'
        percent = _parse_percent(record.get('status_current'))
        if percent is not None:
            if percent >= 99.5:
                return 'Completed'
            return f'{int(round(percent))}%'
        status_text = str(record.get('status_current') or '').strip()
        if 'complete' in status_text.lower():
            return 'Completed'
        return normalize_label(status_text)

    def maintenance_status(tasks):
        if not tasks:
            return '—'
        normalized = [_normalize_status_key(t.get('status')) for t in tasks if isinstance(t, dict)]
        if any(value in {'completed', 'closed', 'done', 'approved'} for value in normalized):
            return 'Completed'
        if any(value in {'in_progress', 'processing', 'ongoing', 'active'} for value in normalized):
            return 'In Progress'
        if any(value in {'pending', 'incoming', 'scheduled'} for value in normalized):
            return 'Pending'
        first = next((t for t in tasks if isinstance(t, dict) and str(t.get('status') or '').strip()), None)
        return normalize_label(first.get('status') if first else '—')

    def last_event_time(events):
        if not events:
            return ''
        for ev in reversed(events):
            if isinstance(ev, dict):
                at = str(ev.get('at') or '').strip()
                if at:
                    return at
        return ''

    def last_division_event_time(events, division_name):
        if not events:
            return ''
        target = str(division_name or '').strip()
        if not target:
            return ''
        for ev in reversed(events):
            if not isinstance(ev, dict):
                continue
            for field in ('from', 'to', 'by'):
                if normalize_division(ev.get(field)) == target:
                    at = str(ev.get('at') or '').strip()
                    if at:
                        return at
        return ''

    def maintenance_status_from_events(events):
        if not events:
            return ''
        for ev in reversed(events):
            if not isinstance(ev, dict):
                continue
            action = str(ev.get('action') or '').strip().lower()
            if 'maintenance status' not in action:
                continue
            note = str(ev.get('note') or '').strip()
            marker = 'status set to'
            lower_note = note.lower()
            if marker in lower_note:
                return note[lower_note.rfind(marker) + len(marker):].strip(' .:-')  # keep original case
        return ''

    payload = {}
    for record in admin_records:
        if not isinstance(record, dict):
            continue
        admin_id = str(record.get('__record_id') or '').strip()
        if not admin_id:
            continue

        planning_record = planning_by_admin_id.get(admin_id)
        construction_record = construction_by_admin_id.get(admin_id)
        quality_record = quality_by_admin_id.get(admin_id)
        maintenance_tasks_for_record = maintenance_by_admin_id.get(admin_id, [])

        routed_to = normalize_division(record.get('division'))
        title = normalize_label(record.get('document_name') or record.get('project_name'))

        raw_events = record.get('__tracking_events')
        events = []
        if isinstance(raw_events, list):
            for ev in raw_events:
                normalized = normalize_event(ev)
                if normalized:
                    events.append(normalized)

        if not events and str(record.get('__submitted_at') or '').strip():
            events.append(
                {
                    'at': str(record.get('__submitted_at') or '').strip(),
                    'action': 'Submitted',
                    'from': normalize_division(record.get('__submitted_from_division')),
                    'to': routed_to,
                    'by': normalize_division(record.get('__submitted_from_division')),
                    'note': '',
                }
            )

        steps = [
            {
                'division': 'Admin',
                'status': admin_status(record),
                'last_update': pick_first(record, '__status_updated_at', '__updated_at', '__submitted_at', 'date_received', 'date'),
                'has_record': True,
            },
            {
                'division': 'Planning',
                'status': planning_status(planning_record),
                'last_update': pick_first(
                    planning_record,
                    '__status_updated_at',
                    '__updated_at',
                    '__received_at',
                    '__created_at',
                    'date_received',
                    'date',
                    'date_received_admin',
                ),
                'has_record': bool(planning_record),
            },
            {
                'division': 'Construction',
                'status': construction_status(construction_record),
                'last_update': pick_first(
                    construction_record,
                    '__status_updated_at',
                    '__updated_at',
                    '__received_at',
                    '__created_at',
                    'date_recv',
                    'date_received',
                    'date_started',
                    'date_completed',
                ),
                'has_record': bool(construction_record),
            },
            {
                'division': 'Quality',
                'status': quality_status(quality_record),
                'last_update': pick_first(
                    quality_record,
                    '__status_updated_at',
                    '__updated_at',
                    '__received_at',
                    '__created_at',
                    'date_recv',
                    'date_received',
                    'doc_date',
                    'date',
                    'date_checked',
                ),
                'has_record': bool(quality_record),
            },
            {
                'division': 'Maintenance',
                'status': (
                    maintenance_status(maintenance_tasks_for_record)
                    if maintenance_tasks_for_record
                    else (
                        maintenance_status_from_events(events)
                        or ('Routed' if (last_division_event_time(events, 'Maintenance') or pick_first(record, 'maintenance_sent_date')) else '—')
                    )
                ),
                'last_update': (
                    pick_first(
                        (maintenance_tasks_for_record[0] if maintenance_tasks_for_record else {}),
                        'updatedAt',
                        'createdAt',
                        'date',
                    )
                    or last_division_event_time(events, 'Maintenance')
                    or pick_first(record, 'maintenance_sent_date')
                ),
                'has_record': (
                    bool(maintenance_tasks_for_record)
                    or bool(last_division_event_time(events, 'Maintenance'))
                    or bool(str(record.get('maintenance_sent_date') or '').strip())
                ),
            },
        ]

        document = {
            'Slip No': normalize_label(record.get('slip_no')),
            'Project / Document': title,
            'Location': normalize_label(record.get('location')),
            'Type': normalize_label(record.get('doc_type') or record.get('document_type')),
            'Contractor': normalize_label(record.get('contractor')),
            'Contract Amount': normalize_label(record.get('revised_contract_amount') or record.get('contract_amount')),
            'Status': normalize_label(record.get('doc_status') or record.get('status')),
            'Routed To': routed_to,
            'Date Received': normalize_label(record.get('date_received')),
            'Description': normalize_label(record.get('description') or record.get('remarks')),
        }

        payload[admin_id] = {
            'admin_id': admin_id,
            'title': title,
            'contractor': normalize_label(record.get('contractor')),
            'routed_to': routed_to,
            'last_update': last_event_time(events) or pick_first(record, '__status_updated_at', '__updated_at', '__submitted_at', 'date_received', 'date'),
            'steps': steps,
            'timeline': events,
            'document': document,
            'related': {
                'planning': {
                    'status': planning_status(planning_record),
                    'reference': normalize_label(pick_first(planning_record, 'doc_no', 'reference_no', 'document_no', 'ppa_no')),
                },
                'construction': {
                    'status': construction_status(construction_record),
                    'progress': normalize_label(pick_first(construction_record, 'status_current', 'progress')),
                },
                'quality': {
                    'status': quality_status(quality_record),
                    'remarks': normalize_label(pick_first(quality_record, 'remarks', 'notes', 'comment')),
                },
                'maintenance': {
                    'status': maintenance_status(maintenance_tasks_for_record),
                    'task_count': len(maintenance_tasks_for_record),
                },
            },
        }

    return payload


_build_tracking_rows_uncached = _build_tracking_rows


def _build_tracking_rows(user):
    cache_key_value = _cache_key(
        "tracking_rows",
        _get_store_cache_version(),
        getattr(user, "pk", "anon"),
    )
    return _cache_get_or_set(
        cache_key_value,
        lambda: _build_tracking_rows_uncached(user),
        timeout=_SYSTEM_COMPUTED_CACHE_TTL,
    )


_build_tracking_payload_uncached = _build_tracking_payload


def _build_tracking_payload(user):
    cache_key_value = _cache_key(
        "tracking_payload",
        _get_store_cache_version(),
        getattr(user, "pk", "anon"),
    )
    return _cache_get_or_set(
        cache_key_value,
        lambda: _build_tracking_payload_uncached(user),
        timeout=_SYSTEM_COMPUTED_CACHE_TTL,
    )


def _build_dashboard_notifications(request, profile, current_section='', page_heading='', current_maintenance=''):
    stores = _load_shared_stores(request.user)
    admin_records = _safe_list(stores.get(KEY_ADMIN).data if stores.get(KEY_ADMIN) else [])
    user_division = _get_user_division_key(request.user)
    is_super = bool(getattr(request.user, "is_superuser", False))

    def parse_event_datetime(value):
        parsed = _parse_loose_datetime(value)
        if not parsed:
            return None
        if timezone.is_aware(parsed):
            return parsed
        try:
            return timezone.make_aware(parsed, timezone.get_current_timezone())
        except Exception:
            return None

    def format_absolute_time(value):
        parsed = parse_event_datetime(value) if not isinstance(value, datetime) else value
        if not parsed:
            return ""
        local_value = timezone.localtime(parsed)
        return local_value.strftime("%b %d, %Y %I:%M %p").replace(" 0", " ")

    def normalize_division_label(value):
        raw = str(value or "").strip()
        if not raw:
            return ""
        key = _normalize_division_key(raw)
        return _division_label_for_key(key) or raw

    def resolve_user_role():
        if request.user.is_superuser:
            return "admin"

        group_names = set()
        try:
            group_names = {str(group.name or "").strip().lower() for group in request.user.groups.all()}
        except Exception:
            group_names = set()

        if any("employer" in name for name in group_names):
            return "employer"
        if any(token in name for name in group_names for token in ("applicant", "jobseeker", "job seeker")):
            return "applicant"
        if request.user.is_staff or user_division:
            return "staff"
        return "applicant"

    viewer_role = resolve_user_role()
    category_catalog = {
        "applications": {"label": "Applications", "icon": "assignment_ind"},
        "documents": {"label": "Documents", "icon": "description"},
        "workflow": {"label": "Workflow", "icon": "sync_alt"},
        "messages": {"label": "Messages", "icon": "mail"},
        "announcements": {"label": "Announcements", "icon": "campaign"},
        "alerts": {"label": "Alerts", "icon": "warning"},
        "reminders": {"label": "Reminders", "icon": "event_upcoming"},
        "admin": {"label": "Admin", "icon": "admin_panel_settings"},
    }

    def is_role_allowed(roles):
        if not roles:
            return True
        if is_super:
            return True
        return viewer_role in set(roles)

    def event_touches_user(from_key, to_key, by_key, assigned_key=""):
        if is_super:
            return True
        if user_division:
            return user_division in {from_key, to_key, by_key, assigned_key}
        return True

    notifications = []
    seen_keys = set()

    def append_notification(
        *,
        key,
        at,
        title,
        message,
        href,
        category,
        icon="notifications",
        severity="info",
        roles=None,
    ):
        normalized_key = str(key or "").strip()
        if not normalized_key or normalized_key in seen_keys:
            return
        if not is_role_allowed(roles):
            return

        at_dt = parse_event_datetime(at) if not isinstance(at, datetime) else at
        at_dt = at_dt or timezone.now()
        meta_parts = []
        abs_stamp = format_absolute_time(at_dt)
        if abs_stamp:
            meta_parts.append(abs_stamp)
        meta_parts.append(_format_notification_time(at_dt, fallback="Recently updated"))
        meta = " | ".join([part for part in meta_parts if part])

        cat_key = str(category or "").strip().lower() or "documents"
        cat_meta = category_catalog.get(cat_key, category_catalog["documents"])

        notifications.append(
            {
                "key": normalized_key,
                "at": at_dt,
                "icon": icon or cat_meta["icon"],
                "title": str(title or "Notification").strip() or "Notification",
                "message": str(message or "Update available.").strip() or "Update available.",
                "meta": meta,
                "href": href or reverse("user_dashboard"),
                "category": cat_key,
                "category_label": cat_meta["label"],
                "severity": str(severity or "info").strip().lower() or "info",
            }
        )
        seen_keys.add(normalized_key)

    def build_document_workflow_notifications():
        for record in admin_records:
            if not isinstance(record, dict):
                continue

            admin_id = str(record.get("__record_id") or "").strip()
            if not admin_id:
                continue

            doc_name = str(
                record.get("document_name")
                or record.get("project_name")
                or record.get("title")
                or "Untitled Document"
            ).strip() or "Untitled Document"
            slip_no = str(record.get("slip_no") or "").strip()
            title = f"{slip_no} | {doc_name}" if slip_no else doc_name
            href = f"{reverse('tracking_details')}?record={admin_id}"
            assigned_key = _normalize_division_key(record.get("division"))

            raw_events = record.get("__tracking_events")
            if not isinstance(raw_events, list):
                raw_events = []

            if not raw_events:
                submitted_at = parse_event_datetime(record.get("__submitted_at"))
                if submitted_at:
                    raw_events = [
                        {
                            "at": submitted_at.isoformat(),
                            "action": "Submitted",
                            "from": record.get("__submitted_from_division"),
                            "to": record.get("division"),
                            "by": record.get("__submitted_from_division"),
                        }
                    ]

            for index, ev in enumerate(raw_events):
                if not isinstance(ev, dict):
                    continue

                at_raw = ev.get("at") or ev.get("timestamp") or ev.get("date")
                at_dt = (
                    parse_event_datetime(at_raw)
                    or parse_event_datetime(record.get("__submitted_at"))
                    or parse_event_datetime(record.get("date_received") or record.get("date"))
                    or timezone.now()
                )

                action = str(ev.get("action") or "Update").strip() or "Update"
                note_label = str(ev.get("note") or ev.get("message") or "").strip()
                from_label = normalize_division_label(ev.get("from") or ev.get("from_division"))
                to_label = normalize_division_label(ev.get("to") or ev.get("to_division"))
                by_label = normalize_division_label(ev.get("by") or ev.get("submitted_by"))

                from_key = _normalize_division_key(from_label)
                to_key = _normalize_division_key(to_label)
                by_key = _normalize_division_key(by_label)

                if not event_touches_user(from_key, to_key, by_key, assigned_key):
                    continue

                action_lower = action.lower()
                note_lower = note_label.lower()
                is_failure = any(token in action_lower or token in note_lower for token in ("fail", "error", "reject", "return"))
                is_transfer = any(token in action_lower for token in ("submit", "route", "forward", "send", "receive", "inbox"))
                is_status = "status" in action_lower or "status set to" in note_lower or "stage" in note_lower
                is_message = bool(note_label) and any(token in note_lower for token in ("message", "note", "remark", "comment"))
                has_route_fields = bool(to_key and ((from_key and from_key != to_key) or (by_key and by_key != to_key)))

                if not (is_failure or is_transfer or is_status or is_message or has_route_fields):
                    continue

                category = "documents"
                icon = "description"
                severity = "info"

                if is_failure:
                    category = "alerts"
                    icon = "error"
                    severity = "critical"
                elif is_message:
                    category = "messages"
                    icon = "mail"
                elif is_status:
                    category = "workflow"
                    icon = "sync_alt"
                elif "submit" in action_lower:
                    category = "applications"
                    icon = "assignment_ind"

                if is_failure:
                    message = "Routing failed"
                    if to_label and from_label:
                        message = f"Routing failed to {to_label} (from {from_label})"
                    elif to_label:
                        message = f"Routing failed to {to_label}"
                    elif from_label:
                        message = f"Routing failed from {from_label}"
                    if note_label:
                        message = f"{message}: {note_label}"
                elif is_status:
                    if note_label:
                        message = note_label
                    elif to_label and from_label:
                        message = f"{action} ({from_label} to {to_label})"
                    else:
                        message = action
                elif user_division and user_division == to_key:
                    sender = from_label or by_label or "another division"
                    message = f"New document received from {sender}"
                elif user_division and user_division in {from_key, by_key} and to_label:
                    message = f"Document sent to {to_label}"
                elif to_label and from_label:
                    message = f"{action} to {to_label} (from {from_label})"
                elif to_label:
                    message = f"{action} to {to_label}"
                elif from_label:
                    message = f"{action} from {from_label}"
                else:
                    message = action
                if note_label and not is_failure and note_label.lower() not in message.lower():
                    message = f"{message}: {note_label}"

                append_notification(
                    key=f"ev|{admin_id}|{index}|{at_dt.isoformat()}|{action}|{from_key}|{to_key}",
                    at=at_dt,
                    title=title,
                    message=message,
                    href=href,
                    category=category,
                    icon=icon,
                    severity=severity,
                    roles=["admin", "staff", "employer", "applicant"],
                )

            attachments = record.get("__attachments")
            if isinstance(attachments, list):
                for att in attachments:
                    if not isinstance(att, dict):
                        continue

                    file_name = str(att.get("name") or att.get("fileName") or "attachment").strip() or "attachment"
                    added_at_raw = att.get("addedAt") or att.get("added_at") or record.get("__updated_at") or record.get("__submitted_at")
                    added_at = parse_event_datetime(added_at_raw) or timezone.now()
                    added_by = str(att.get("addedBy") or "").strip()
                    added_by_label = normalize_division_label(added_by) or added_by or "A user"
                    added_by_key = _normalize_division_key(added_by_label)

                    if not event_touches_user(added_by_key, assigned_key, assigned_key, assigned_key):
                        continue

                    append_notification(
                        key=f"att|{admin_id}|{str(att.get('id') or file_name)}|{added_at.isoformat()}",
                        at=added_at,
                        title=title,
                        message=f"{added_by_label} uploaded {file_name}",
                        href=href,
                        category="documents",
                        icon="upload_file",
                        severity="info",
                        roles=["admin", "staff", "employer", "applicant"],
                    )

            deadline_candidates = [
                record.get("revised_completion_date"),
                record.get("target_completion_date"),
                record.get("completion_date"),
                record.get("due_date"),
                record.get("dueDateIso"),
            ]
            deadline_dt = None
            for candidate in deadline_candidates:
                parsed_deadline = parse_event_datetime(candidate)
                if parsed_deadline:
                    deadline_dt = parsed_deadline
                    break
            if deadline_dt:
                status_text = str(record.get("doc_status") or record.get("status") or "").strip().lower()
                is_done = any(token in status_text for token in ("complete", "approved", "closed", "done"))
                if not is_done and event_touches_user("", assigned_key, "", assigned_key):
                    today = timezone.localtime(timezone.now()).date()
                    due_date = timezone.localtime(deadline_dt).date()
                    days_left = (due_date - today).days
                    if -14 <= days_left <= 14:
                        if days_left < 0:
                            message = f"Deadline passed {abs(days_left)} day{'s' if abs(days_left) != 1 else ''} ago"
                            category = "alerts"
                            icon = "event_busy"
                            severity = "high"
                        elif days_left == 0:
                            message = "Deadline is today"
                            category = "reminders"
                            icon = "event_upcoming"
                            severity = "medium"
                        else:
                            message = f"Deadline in {days_left} day{'s' if days_left != 1 else ''}"
                            category = "reminders"
                            icon = "event_upcoming"
                            severity = "info"

                        append_notification(
                            key=f"deadline|{admin_id}|{due_date.isoformat()}",
                            at=deadline_dt,
                            title=title,
                            message=message,
                            href=href,
                            category=category,
                            icon=icon,
                            severity=severity,
                            roles=["admin", "staff", "employer", "applicant"],
                        )

    def build_admin_staff_notifications():
        if viewer_role not in {"admin", "staff"}:
            return

        user_model = get_user_model()
        now = timezone.now()
        recent_cutoff = now - timedelta(days=14)
        recent_users = user_model.objects.exclude(id=request.user.id).order_by("-date_joined")[:12]
        for created_user in recent_users:
            joined_at = getattr(created_user, "date_joined", None)
            if not joined_at or joined_at < recent_cutoff:
                continue
            username = str(created_user.get_username() or "User").strip() or "User"
            message = f"{username} registered a new portal account"
            category = "admin"
            icon = "person_add"
            severity = "info"
            if not bool(getattr(created_user, "is_active", True)):
                message = f"{username} account is pending approval"
                category = "alerts"
                icon = "pending_actions"
                severity = "medium"

            append_notification(
                key=f"user_joined|{created_user.id}|{joined_at.isoformat()}",
                at=joined_at,
                title="User Registration",
                message=message,
                href=f"{reverse('account_settings')}#account-settings-history",
                category=category,
                icon=icon,
                severity=severity,
                roles=["admin", "staff"],
            )

        pending_count = user_model.objects.filter(is_active=False).count()
        if pending_count > 0:
            append_notification(
                key=f"user_pending_total|{pending_count}",
                at=timezone.now(),
                title="Approvals Needed",
                message=f"{pending_count} user account{'s' if pending_count != 1 else ''} pending approval",
                href=f"{reverse('account_settings')}#account-settings-history",
                category="admin",
                icon="admin_panel_settings",
                severity="medium",
                roles=["admin", "staff"],
            )

        stale_days = 7
        stale_keys = []
        for key in (KEY_ADMIN, KEY_PLANNING, KEY_CONSTRUCTION, KEY_QUALITY, KEY_MAINTENANCE):
            store = stores.get(key)
            if not store or not getattr(store, "updated_at", None):
                stale_keys.append(_division_label_for_key(key) or key.title())
                continue
            if (now - store.updated_at) > timedelta(days=stale_days):
                stale_keys.append(_division_label_for_key(key) or key.title())
        if stale_keys:
            append_notification(
                key=f"stale_stores|{'|'.join(stale_keys)}",
                at=timezone.now(),
                title="Sync Reminder",
                message=f"Store sync needed: {', '.join(stale_keys[:3])}{'...' if len(stale_keys) > 3 else ''}",
                href=reverse("user_dashboard"),
                category="announcements",
                icon="campaign",
                severity="medium",
                roles=["admin", "staff"],
            )

    def build_system_alert_notifications():
        group_division_key = _division_key_from_groups(request.user)
        profile_division_key = _normalize_division_key(getattr(profile, "division", ""))
        if group_division_key and profile_division_key and group_division_key != profile_division_key:
            append_notification(
                key=f"division_mismatch|{request.user.id}|{group_division_key}|{profile_division_key}",
                at=timezone.now(),
                title="Security Alert",
                message="Division mismatch detected in account profile. Review account settings.",
                href=f"{reverse('account_settings')}#account-settings-profile",
                category="alerts",
                icon="shield_lock",
                severity="critical",
                roles=["admin", "staff", "employer", "applicant"],
            )

    if not bool(getattr(profile, "portal_notifications", True)):
        disabled_item = {
            "key": "portal_notifications_disabled",
            "at": timezone.now(),
            "icon": "notifications_off",
            "title": "Portal Notifications Disabled",
            "message": "Enable notifications in settings to receive new updates.",
            "meta": _format_notification_time(timezone.now(), fallback="Recently updated"),
            "href": f"{reverse('account_settings')}#account-settings-notifications",
            "category": "alerts",
            "category_label": category_catalog["alerts"]["label"],
            "severity": "medium",
        }
        return {
            "dashboard_notifications": [disabled_item],
            "dashboard_notification_count": 1,
            "dashboard_has_notifications": True,
            "dashboard_notification_categories": [
                {
                    "key": "alerts",
                    "label": category_catalog["alerts"]["label"],
                    "icon": category_catalog["alerts"]["icon"],
                    "count": 1,
                }
            ],
            "dashboard_notification_user_role": viewer_role,
        }

    build_document_workflow_notifications()
    build_admin_staff_notifications()
    build_system_alert_notifications()

    notifications.sort(key=lambda item: item.get("at") or timezone.now(), reverse=True)
    notifications = notifications[:40]

    category_counts = {}
    for item in notifications:
        key = str(item.get("category") or "documents").strip().lower() or "documents"
        category_counts[key] = category_counts.get(key, 0) + 1

    preferred_category_order = (
        "applications",
        "documents",
        "workflow",
        "messages",
        "announcements",
        "alerts",
        "reminders",
        "admin",
    )
    category_items = []
    for key in preferred_category_order:
        count = category_counts.get(key, 0)
        if count <= 0:
            continue
        meta = category_catalog.get(key, category_catalog["documents"])
        category_items.append(
            {
                "key": key,
                "label": meta["label"],
                "icon": meta["icon"],
                "count": count,
            }
        )

    return {
        "dashboard_notifications": notifications,
        "dashboard_notification_count": len(notifications),
        "dashboard_has_notifications": bool(notifications),
        "dashboard_notification_categories": category_items,
        "dashboard_notification_user_role": viewer_role,
    }


_build_dashboard_notifications_uncached = _build_dashboard_notifications


def _build_dashboard_notifications(request, profile, current_section='', page_heading='', current_maintenance=''):
    profile_updated_at = getattr(profile, "updated_at", None)
    profile_stamp = profile_updated_at.isoformat() if profile_updated_at else ""
    cache_key_value = _cache_key(
        "dashboard_notifications",
        _get_store_cache_version(),
        getattr(request.user, "pk", "anon"),
        profile_stamp,
        current_section,
        page_heading,
        current_maintenance,
        int(bool(getattr(request.user, "is_staff", False))),
        int(bool(getattr(request.user, "is_superuser", False))),
    )
    return _cache_get_or_set(
        cache_key_value,
        lambda: _build_dashboard_notifications_uncached(
            request,
            profile,
            current_section=current_section,
            page_heading=page_heading,
            current_maintenance=current_maintenance,
        ),
        timeout=_SYSTEM_COMPUTED_CACHE_TTL,
    )


def _build_dashboard_context(request, **extra):
    profile = _get_user_profile(request.user)
    current_section = extra.get('current_section', '')
    page_heading = extra.get('page_heading', '')
    current_maintenance = extra.get('current_maintenance', '')

    context = _build_user_identity(request.user, profile=profile)
    user_division_key = _get_user_division_key(request.user)
    group_division_key = _division_key_from_groups(request.user)
    profile_division_key = _normalize_division_key(getattr(profile, "division", ""))
    division_mismatch = bool(group_division_key and profile_division_key and group_division_key != profile_division_key)
    division_sections = {KEY_ADMIN, KEY_PLANNING, KEY_CONSTRUCTION, KEY_QUALITY, KEY_MAINTENANCE}
    dashboard_readonly = (
        not request.user.is_superuser
        and current_section in division_sections
        and (not user_division_key or current_section != user_division_key)
    )
    context.update(
        {
            "user_division_key": user_division_key,
            "user_division_label": _division_label_for_key(user_division_key) or "Unassigned Division",
            "user_division_mismatch": division_mismatch,
            "dashboard_readonly": dashboard_readonly,
            "dashboard_can_edit": not dashboard_readonly,
        }
    )
    context.update(
        _build_dashboard_notifications(
            request,
            profile=profile,
            current_section=current_section,
            page_heading=page_heading,
            current_maintenance=current_maintenance,
        )
    )
    context.update(extra)

    if current_section in ('', 'workflow'):
        overview_defaults = _build_overview_context(request.user)
        for key, value in overview_defaults.items():
            context.setdefault(key, value)

    return context


@login_required
def tracking_details(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='tracking',
            page_heading='Tracking Details',
            tracking_rows=_build_tracking_rows(request.user),
            tracking_payload=_build_tracking_payload(request.user),
        ),
    )


@login_required
def account_settings(request):
    profile = _get_user_profile(request.user)
    saved_section = request.GET.get('saved', '')

    if request.method == 'POST':
        if request.POST.get('settings_form') == 'password':
            form = AccountSettingsForm(user=request.user, profile=profile)
            password_form = PasswordChangeForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                return HttpResponseRedirect(f"{reverse('account_settings')}?saved=password#account-settings-password")
        else:
            form = AccountSettingsForm(request.POST, request.FILES, user=request.user, profile=profile)
            password_form = PasswordChangeForm(request.user)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(f"{reverse('account_settings')}?saved=profile#account-settings-profile")
    else:
        form = AccountSettingsForm(user=request.user, profile=profile)
        password_form = PasswordChangeForm(request.user)

    context = _build_dashboard_context(
        request,
        current_section='settings',
        page_heading='Account Settings',
        form=form,
        password_form=password_form,
        saved_section=saved_section,
        saved=bool(saved_section),
    )
    return render(request, 'Dashboard/dashboard.html', context)


@login_required
def user_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='workflow',
            page_heading='Workflow Management',
        ),
    )


@login_required
def admin_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='admin',
            page_heading='Admin Division',
        ),
    )


@login_required
def construction_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='construction',
            current_construction='table',
            page_heading='Construction Division',
            construction_template='construction/construction.html',
        ),
    )


@login_required
def construction_project_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='construction',
            current_construction='project',
            page_heading='Construction Project Dashboard',
            construction_template='construction/construction_project_dashboard.html',
        ),
    )


@login_required
def construction_task_table(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='construction',
            current_construction='task',
            page_heading='Construction Task Table',
            construction_template='construction/construction_task_table.html',
        ),
    )


@login_required
def planning_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='planning',
            page_heading='Planning Division',
        ),
    )


@login_required
def quality_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='quality',
            page_heading='Quality Division',
        ),
    )


@login_required
@ensure_csrf_cookie
def project_dashboard(request):
    store_defaults = {
        KEY_ADMIN: [],
        KEY_PLANNING: [],
        KEY_CONSTRUCTION: [],
        KEY_QUALITY: [],
        KEY_MAINTENANCE: {},
    }
    project_store_seed = dict(store_defaults)

    did_bootstrap_shared_store = False
    try:
        for key in store_defaults.keys():
            shared_store, _ = SharedDivisionStore.objects.get_or_create(key=key)
            if _shared_store_should_bootstrap(key, shared_store):
                candidate = (
                    DivisionStore.objects.filter(key=key)
                    .order_by("-updated_at")
                    .first()
                )
                if candidate and not _is_empty_division_store_payload(key, candidate.data):
                    shared_store.data = candidate.data
                    shared_store.save(update_fields=["data", "updated_at"])
                    did_bootstrap_shared_store = True

            project_store_seed[key] = shared_store.data
    except (OperationalError, ProgrammingError):
        # Backward-compat if SharedDivisionStore isn't migrated yet.
        for key, fallback in store_defaults.items():
            candidate = (
                DivisionStore.objects.filter(key=key)
                .order_by("-updated_at")
                .first()
            )
            project_store_seed[key] = candidate.data if candidate else fallback

    if did_bootstrap_shared_store:
        _invalidate_store_cache()

    # Normalize seed types for the client.
    for key in store_defaults.keys():
        data = project_store_seed.get(key)
        if key == KEY_MAINTENANCE:
            project_store_seed[key] = data if isinstance(data, dict) else {}
        else:
            project_store_seed[key] = data if isinstance(data, list) else []

    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='project',
            page_heading='Project Database',
            project_store_seed=project_store_seed,
        ),
    )


@login_required
def project_construction_history(request, source_id):
    return render(
        request,
        "Dashboard/dashboard.html",
        _build_dashboard_context(
            request,
            current_section="project",
            page_heading="Construction Monthly History",
            project_history_source_id=str(source_id or "").strip(),
        ),
    )


@login_required
def admin_division_submissions(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='admin',
            page_heading='Admin Division Submissions',
            admin_template='shared/division_submissions.html',
            submissions_division_key='admin',
            submissions_main_url=reverse('admin_division_dashboard'),
            submissions_url=reverse('admin_division_submissions'),
        ),
    )


@login_required
def planning_division_submissions(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='planning',
            page_heading='Planning Division Submissions',
            planning_template='shared/division_submissions.html',
            submissions_division_key='planning',
            submissions_main_url=reverse('planning_division_dashboard'),
            submissions_url=reverse('planning_division_submissions'),
        ),
    )


@login_required
def construction_division_submissions(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='construction',
            current_construction='proposal',
            page_heading='Construction Project Proposal',
            construction_template='construction/construction_project_proposal.html',
        ),
    )


@login_required
def quality_division_submissions(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='quality',
            page_heading='Quality Division Submissions',
            quality_template='shared/division_submissions.html',
            submissions_division_key='quality',
            submissions_main_url=reverse('quality_division_dashboard'),
            submissions_url=reverse('quality_division_submissions'),
        ),
    )


@login_required
def maintenance_division_submissions(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='maintenance',
            page_heading='Maintenance Division Submissions',
            maintenance_template='shared/division_submissions.html',
            submissions_division_key='maintenance',
            submissions_main_url=reverse('road_management'),
            submissions_url=reverse('maintenance_division_submissions'),
        ),
    )


@login_required
@require_http_methods(["GET", "POST"])
def division_store_api(request, key):
    allowed_keys = {choice[0] for choice in SharedDivisionStore.KEY_CHOICES}
    if key not in allowed_keys:
        return JsonResponse({"error": "Unknown store key."}, status=404)

    using_shared_store = True
    try:
        store, _ = SharedDivisionStore.objects.get_or_create(key=key)
    except (OperationalError, ProgrammingError):
        # Backward-compat before the SharedDivisionStore migration is applied.
        using_shared_store = False
        store, _ = DivisionStore.objects.get_or_create(user=request.user, key=key)

    if request.method == "GET":
        if using_shared_store:
            # Bootstrap shared store from the most recently updated per-user store (if shared is empty).
            if _shared_store_should_bootstrap(key, store):
                candidate = (
                    DivisionStore.objects.filter(key=key)
                    .order_by("-updated_at")
                    .first()
                )
                if candidate and not _is_empty_division_store_payload(key, candidate.data):
                    store.data = candidate.data
                    store.save(update_fields=["data", "updated_at"])
                    _invalidate_store_cache()

        return JsonResponse(
            {
                "key": key,
                "data": store.data,
                "updated_at": store.updated_at.isoformat() if store.updated_at else None,
            }
        )

    try:
        payload = json.loads((request.body or b"").decode("utf-8") or "null")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    write_mode = _store_write_mode(request.user, key)
    if not write_mode:
        return JsonResponse({"error": "Read-only access for this division store."}, status=403)

    if write_mode == "restricted_admin_submit":
        user_division = _get_user_division_key(request.user)
        if not user_division:
            return JsonResponse({"error": "Division is not configured for this account."}, status=403)
        store.data = _enforce_admin_submit_payload(user_division, store.data, payload)
    else:
        store.data = payload
    store.save()
    _invalidate_store_cache()

    _safe_log_division_store_event(
        actor=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
        store_key=key,
        target=DivisionStoreEvent.TARGET_SHARED if using_shared_store else DivisionStoreEvent.TARGET_USER,
        write_mode=write_mode,
        request_payload=payload,
        stored_payload=store.data,
        path=getattr(request, "path", ""),
        method=getattr(request, "method", ""),
    )
    _broadcast_division_store_update(
        store_keys=[key],
        actor=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
        updated_at=store.updated_at.isoformat() if store.updated_at else timezone.now().isoformat(),
    )

    return JsonResponse(
        {
            "ok": True,
            "updated_at": store.updated_at.isoformat() if store.updated_at else None,
        }
    )


@login_required
@require_http_methods(["POST"])
def division_store_clear_all_api(request):
    user_division = _get_user_division_key(request.user)
    if not request.user.is_superuser and user_division != KEY_ADMIN:
        return JsonResponse({"error": "Forbidden."}, status=403)

    allowed_keys = {choice[0] for choice in SharedDivisionStore.KEY_CHOICES}

    cleared = []
    for key in allowed_keys:
        empty_payload = {} if key == KEY_MAINTENANCE else []
        try:
            store, _ = SharedDivisionStore.objects.get_or_create(key=key)
            store.data = empty_payload
            store.save(update_fields=["data", "updated_at"])
            cleared.append(key)

            _safe_log_division_store_event(
                actor=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
                store_key=key,
                target=DivisionStoreEvent.TARGET_SHARED,
                write_mode="clear_all",
                request_payload=None,
                stored_payload=empty_payload,
                path=getattr(request, "path", ""),
                method=getattr(request, "method", ""),
            )
        except (OperationalError, ProgrammingError):
            # Shared store not available; fall back to wiping per-user stores below.
            pass

    # Remove any per-user stores so the shared store can't be re-bootstrapped from old data.
    try:
        DivisionStore.objects.filter(key__in=allowed_keys).delete()
    except Exception:
        # Ignore database issues; clearing shared stores is still best-effort.
        pass

    _invalidate_store_cache()
    if cleared:
        _broadcast_division_store_update(
            store_keys=cleared,
            actor=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
            updated_at=timezone.now().isoformat(),
        )

    return JsonResponse({"ok": True, "cleared": sorted(cleared)})


@login_required
@require_http_methods(["POST"])
def construction_photo_upload(request):
    if not request.user.is_superuser:
        user_division = _get_user_division_key(request.user)
        if user_division != KEY_CONSTRUCTION:
            return JsonResponse({"error": "Read-only access for construction uploads."}, status=403)

    files = (
        request.FILES.getlist("files")
        or request.FILES.getlist("photos")
        or request.FILES.getlist("photo")
        or request.FILES.getlist("accomplishment_photos")
    )
    if not files:
        return JsonResponse({"error": "No files uploaded."}, status=400)

    allowed_exts = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf"}
    uploads_dir = Path(__file__).resolve().parent / "static" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    stored = []
    for file in files:
        if not file:
            continue

        original_name = get_valid_filename(getattr(file, "name", "") or "image")
        ext = Path(original_name).suffix.lower()
        if ext not in allowed_exts:
            return JsonResponse({"error": f"Unsupported file type: {ext or 'unknown'}."}, status=400)

        size = getattr(file, "size", 0) or 0

        # Keep filenames stable and avoid collisions.
        filename = f"construction_{uuid.uuid4().hex}{ext}"
        destination = uploads_dir / filename

        with destination.open("wb") as handle:
            for chunk in file.chunks():
                handle.write(chunk)

        url = f"/static/uploads/{filename}"
        stored.append({"name": filename, "original_name": original_name, "url": url})

        try:
            ConstructionUpload.objects.create(
                uploaded_by=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
                stored_name=filename,
                original_name=original_name,
                url=url,
                content_type=str(getattr(file, "content_type", "") or ""),
                size_bytes=int(size or 0),
            )
        except (OperationalError, ProgrammingError):
            pass
        except Exception:
            pass

    if not stored:
        return JsonResponse({"error": "No valid files uploaded."}, status=400)

    _invalidate_store_cache()

    return JsonResponse({"ok": True, "files": stored})


@login_required
def road_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='maintenance',
            current_maintenance='road',
            page_heading='Road Management',
            maintenance_template='Maintenance/includes/road_management_table.html',
        ),
    )


@login_required
def contractor_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='maintenance',
            current_maintenance='contractor',
            page_heading='Contractor Management',
            maintenance_template='Maintenance/includes/contractor_management_table.html',
        ),
    )


@login_required
def task_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='maintenance',
            current_maintenance='task',
            page_heading='Task Management',
            maintenance_template='Maintenance/includes/task_management_table.html',
        ),
    )


def signup(request):
    if request.user.is_authenticated:
        return redirect('user_dashboard')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('user_dashboard')
    else:
        form = UserCreationForm()

    return render(request, 'registration/signup.html', {'form': form})
