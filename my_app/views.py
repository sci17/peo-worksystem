import json
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from django.contrib.auth import login
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.utils.text import get_valid_filename
from django.views.decorators.http import require_http_methods

from .forms import AccountSettingsForm
from .models import DivisionStore
from .models import UserProfile


def _get_user_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


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
        return datetime.fromisoformat(text)
    except ValueError:
        pass

    patterns = (
        '%Y-%m-%d',
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


def _build_overview_context(user):
    stores = {
        store.key: store
        for store in DivisionStore.objects.filter(
            user=user,
            key__in=(
                DivisionStore.KEY_ADMIN,
                DivisionStore.KEY_PLANNING,
                DivisionStore.KEY_CONSTRUCTION,
                DivisionStore.KEY_QUALITY,
                DivisionStore.KEY_MAINTENANCE,
            ),
        )
    }

    admin_records = _safe_list(stores.get(DivisionStore.KEY_ADMIN).data if stores.get(DivisionStore.KEY_ADMIN) else [])
    planning_records = _safe_list(stores.get(DivisionStore.KEY_PLANNING).data if stores.get(DivisionStore.KEY_PLANNING) else [])
    construction_records = _safe_list(stores.get(DivisionStore.KEY_CONSTRUCTION).data if stores.get(DivisionStore.KEY_CONSTRUCTION) else [])
    quality_records = _safe_list(stores.get(DivisionStore.KEY_QUALITY).data if stores.get(DivisionStore.KEY_QUALITY) else [])
    maintenance_payload = stores.get(DivisionStore.KEY_MAINTENANCE).data if stores.get(DivisionStore.KEY_MAINTENANCE) else {}
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
        for item in completed_projects[:5]
    ]

    # Recent activity (division store syncs)
    activity_entries = []
    dot_class_for = {
        DivisionStore.KEY_ADMIN: 'dot-blue',
        DivisionStore.KEY_PLANNING: 'dot-amber',
        DivisionStore.KEY_CONSTRUCTION: 'dot-green',
        DivisionStore.KEY_QUALITY: 'dot-slate',
        DivisionStore.KEY_MAINTENANCE: 'dot-blue',
    }
    label_for = {
        DivisionStore.KEY_ADMIN: 'Admin Division',
        DivisionStore.KEY_PLANNING: 'Planning Division',
        DivisionStore.KEY_CONSTRUCTION: 'Construction Division',
        DivisionStore.KEY_QUALITY: 'Quality Division',
        DivisionStore.KEY_MAINTENANCE: 'Maintenance Division',
    }

    min_sort_time = now - timedelta(days=36500)
    for key in (
        DivisionStore.KEY_PLANNING,
        DivisionStore.KEY_QUALITY,
        DivisionStore.KEY_CONSTRUCTION,
        DivisionStore.KEY_ADMIN,
        DivisionStore.KEY_MAINTENANCE,
    ):
        store = stores.get(key)
        payload = store.data if store else ([] if key != DivisionStore.KEY_MAINTENANCE else {})
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
            'Admin': DivisionStore.KEY_ADMIN,
            'Planning': DivisionStore.KEY_PLANNING,
            'Construction': DivisionStore.KEY_CONSTRUCTION,
            'Quality': DivisionStore.KEY_QUALITY,
            'Maintenance': DivisionStore.KEY_MAINTENANCE,
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
        'overview_leadership_executive': None,
        'overview_leadership_divisions': [],
        'overview_recent_activity': recent_activity,
        'overview_division_performance': performance_metrics,
        'overview_top_performer': top_division,
        'overview_overall_efficiency': f'{avg_efficiency}%',
        'overview_division_progress': division_progress_rows,
    }


def _build_tracking_rows(user):
    def load_stores():
        stores = {
            store.key: store
            for store in DivisionStore.objects.filter(
                user=user,
                key__in=(
                    DivisionStore.KEY_ADMIN,
                    DivisionStore.KEY_PLANNING,
                    DivisionStore.KEY_CONSTRUCTION,
                    DivisionStore.KEY_QUALITY,
                    DivisionStore.KEY_MAINTENANCE,
                ),
            )
        }

        admin_records = _safe_list(stores.get(DivisionStore.KEY_ADMIN).data if stores.get(DivisionStore.KEY_ADMIN) else [])
        planning_records = _safe_list(
            stores.get(DivisionStore.KEY_PLANNING).data if stores.get(DivisionStore.KEY_PLANNING) else []
        )
        construction_records = _safe_list(
            stores.get(DivisionStore.KEY_CONSTRUCTION).data if stores.get(DivisionStore.KEY_CONSTRUCTION) else []
        )
        quality_records = _safe_list(stores.get(DivisionStore.KEY_QUALITY).data if stores.get(DivisionStore.KEY_QUALITY) else [])
        maintenance_payload = stores.get(DivisionStore.KEY_MAINTENANCE).data if stores.get(DivisionStore.KEY_MAINTENANCE) else {}
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

    planning_by_admin_id = {}
    for record in planning_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
        if not source_id:
            continue
        planning_by_admin_id[source_id] = record

    construction_by_admin_id = {}
    for record in construction_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
        if not source_id:
            continue
        construction_by_admin_id[source_id] = record

    quality_by_admin_id = {}
    for record in quality_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
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
    stores = {
        store.key: store
        for store in DivisionStore.objects.filter(
            user=user,
            key__in=(
                DivisionStore.KEY_ADMIN,
                DivisionStore.KEY_PLANNING,
                DivisionStore.KEY_CONSTRUCTION,
                DivisionStore.KEY_QUALITY,
                DivisionStore.KEY_MAINTENANCE,
            ),
        )
    }

    admin_records = _safe_list(stores.get(DivisionStore.KEY_ADMIN).data if stores.get(DivisionStore.KEY_ADMIN) else [])
    planning_records = _safe_list(stores.get(DivisionStore.KEY_PLANNING).data if stores.get(DivisionStore.KEY_PLANNING) else [])
    construction_records = _safe_list(stores.get(DivisionStore.KEY_CONSTRUCTION).data if stores.get(DivisionStore.KEY_CONSTRUCTION) else [])
    quality_records = _safe_list(stores.get(DivisionStore.KEY_QUALITY).data if stores.get(DivisionStore.KEY_QUALITY) else [])
    maintenance_payload = stores.get(DivisionStore.KEY_MAINTENANCE).data if stores.get(DivisionStore.KEY_MAINTENANCE) else {}
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

    planning_by_admin_id = {}
    for record in planning_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
        if not source_id:
            continue
        planning_by_admin_id[source_id] = record

    construction_by_admin_id = {}
    for record in construction_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
        if not source_id:
            continue
        construction_by_admin_id[source_id] = record

    quality_by_admin_id = {}
    for record in quality_records:
        if not isinstance(record, dict):
            continue
        source_id = str(record.get('__admin_source_id') or '').strip()
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
                'last_update': pick_first(record, '__submitted_at', '__updated_at', 'date_received', 'date'),
                'has_record': True,
            },
            {
                'division': 'Planning',
                'status': planning_status(planning_record),
                'last_update': pick_first(planning_record, '__updated_at', 'date_received', 'date', 'date_received_admin'),
                'has_record': bool(planning_record),
            },
            {
                'division': 'Construction',
                'status': construction_status(construction_record),
                'last_update': pick_first(construction_record, '__updated_at', 'date_received', 'date_started', 'date_completed'),
                'has_record': bool(construction_record),
            },
            {
                'division': 'Quality',
                'status': quality_status(quality_record),
                'last_update': pick_first(quality_record, '__updated_at', 'date_received', 'date', 'date_checked'),
                'has_record': bool(quality_record),
            },
            {
                'division': 'Maintenance',
                'status': maintenance_status(maintenance_tasks_for_record),
                'last_update': pick_first(
                    (maintenance_tasks_for_record[0] if maintenance_tasks_for_record else {}),
                    'updatedAt',
                    'createdAt',
                    'date',
                ),
                'has_record': bool(maintenance_tasks_for_record),
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
            'last_update': last_event_time(events) or pick_first(record, '__submitted_at', '__updated_at', 'date_received', 'date'),
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


def _build_dashboard_notifications(request, profile, current_section='', page_heading='', current_maintenance=''):
    section_updates = {
        'workflow': {
            'icon': 'dashboard_customize',
            'title': 'Workflow dashboard is live',
            'message': 'Active projects, approvals, and update metrics are ready for monitoring.',
            'href': reverse('user_dashboard'),
        },
        'admin': {
            'icon': 'admin_panel_settings',
            'title': 'Admin Division queue is active',
            'message': 'Document routing and billing review tools are available in the admin workspace.',
            'href': reverse('admin_division_dashboard'),
        },
        'planning': {
            'icon': 'architecture',
            'title': 'Planning Division workspace is active',
            'message': 'Planning records and division workflow controls are ready for use.',
            'href': reverse('planning_division_dashboard'),
        },
        'project': {
            'icon': 'folder_open',
            'title': 'Project registry is available',
            'message': 'Shared project records are ready for searching and division review.',
            'href': reverse('project_dashboard'),
        },
        'construction': {
            'icon': 'construction',
            'title': 'Construction Division updates are available',
            'message': 'Construction workflow items are ready from the main division board.',
            'href': reverse('construction_division_dashboard'),
        },
        'quality': {
            'icon': 'verified',
            'title': 'Quality Division checks are active',
            'message': 'Quality assurance workflow items are available for monitoring.',
            'href': reverse('quality_division_dashboard'),
        },
        'maintenance': {
            'icon': 'build',
            'title': 'Maintenance tools are open',
            'message': f'{(current_maintenance or "maintenance").replace("_", " ").title()} workflow is loaded from the sidebar.',
            'href': reverse(
                'road_management' if current_maintenance == 'road'
                else 'contractor_management' if current_maintenance == 'contractor'
                else 'task_management'
            ),
        },
        'settings': {
            'icon': 'settings',
            'title': 'Account settings are ready',
            'message': 'Profile, password, notifications, appearance, and support settings are available here.',
            'href': f"{reverse('account_settings')}#account-settings-profile",
        },
    }

    notifications_message = (
        'Email and portal workflow alerts are enabled.'
        if profile.email_notifications and profile.portal_notifications
        else 'Some workflow alerts are currently turned off in your notification preferences.'
    )
    notifications_meta = (
        'All alerts enabled'
        if profile.email_notifications and profile.portal_notifications
        else 'Review notification preferences'
    )

    profile_dir = Path(__file__).resolve().parent / "static" / "profile"
    legacy_uploads_dir = Path(__file__).resolve().parent / "static" / "uploads"

    def has_static_profile_picture(base_dir):
        if not base_dir.exists():
            return False
        return any((base_dir / f"profile_{request.user.id}{ext}").exists() for ext in (".jpg", ".jpeg", ".png", ".webp"))

    has_static_picture = has_static_profile_picture(profile_dir) or has_static_profile_picture(legacy_uploads_dir)

    if request.user.get_full_name().strip() and (profile.profile_picture or has_static_picture):
        profile_title = 'Profile is fully set up'
        profile_message = 'Your account name and profile picture are ready across the portal.'
        profile_meta = 'Profile complete'
    else:
        profile_title = 'Finish your account profile'
        profile_message = 'Add your full name and profile picture so your workflow account is easier to identify.'
        profile_meta = 'Recommended'

    last_login = request.user.last_login or request.user.date_joined
    notifications = [
        {
            'icon': section_updates.get(current_section, section_updates['workflow'])['icon'],
            'title': section_updates.get(current_section, section_updates['workflow'])['title'],
            'message': section_updates.get(current_section, section_updates['workflow'])['message'],
            'meta': page_heading or 'Portal workspace',
            'href': section_updates.get(current_section, section_updates['workflow'])['href'],
        },
        {
            'icon': 'person',
            'title': profile_title,
            'message': profile_message,
            'meta': profile_meta,
            'href': f"{reverse('account_settings')}#account-settings-profile",
        },
        {
            'icon': 'notifications_active',
            'title': 'Workflow notifications synced',
            'message': notifications_message,
            'meta': notifications_meta,
            'href': f"{reverse('account_settings')}#account-settings-notifications",
        },
        {
            'icon': 'shield_lock',
            'title': 'Account security is protected',
            'message': 'Use the password panel any time you need to rotate or strengthen your sign-in credentials.',
            'meta': 'Security controls',
            'href': f"{reverse('account_settings')}#account-settings-password",
        },
        {
            'icon': 'history',
            'title': 'Recent account activity recorded',
            'message': f'Last sign-in for {request.user.get_username()} was saved to your activity history.',
            'meta': _format_notification_time(last_login, fallback='Account history available'),
            'href': f"{reverse('account_settings')}#account-settings-history",
        },
    ]

    return {
        'dashboard_notifications': notifications,
        'dashboard_notification_count': len(notifications),
        'dashboard_has_notifications': bool(notifications),
    }


def _build_dashboard_context(request, **extra):
    profile = _get_user_profile(request.user)
    current_section = extra.get('current_section', '')
    page_heading = extra.get('page_heading', '')
    current_maintenance = extra.get('current_maintenance', '')

    context = _build_user_identity(request.user, profile=profile)
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
            page_heading='Construction Project Dashboard',
            construction_template='construction/construction_project_dashboard.html',
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
def project_dashboard(request):
    store_defaults = {
        DivisionStore.KEY_ADMIN: [],
        DivisionStore.KEY_PLANNING: [],
        DivisionStore.KEY_CONSTRUCTION: [],
        DivisionStore.KEY_QUALITY: [],
        DivisionStore.KEY_MAINTENANCE: {},
    }
    project_store_seed = dict(store_defaults)

    for store in DivisionStore.objects.filter(user=request.user, key__in=store_defaults.keys()):
        if store.key == DivisionStore.KEY_MAINTENANCE:
            project_store_seed[store.key] = store.data if isinstance(store.data, dict) else {}
        else:
            project_store_seed[store.key] = store.data if isinstance(store.data, list) else []

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
            page_heading='Construction Division Submissions',
            construction_template='shared/division_submissions.html',
            submissions_division_key='construction',
            submissions_main_url=reverse('construction_division_dashboard'),
            submissions_url=reverse('construction_division_submissions'),
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
    allowed_keys = {choice[0] for choice in DivisionStore.KEY_CHOICES}
    if key not in allowed_keys:
        return JsonResponse({"error": "Unknown store key."}, status=404)

    store, _ = DivisionStore.objects.get_or_create(user=request.user, key=key)

    if request.method == "GET":
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

    store.data = payload
    store.save()

    return JsonResponse(
        {
            "ok": True,
            "updated_at": store.updated_at.isoformat() if store.updated_at else None,
        }
    )


@login_required
@require_http_methods(["POST"])
def construction_photo_upload(request):
    files = request.FILES.getlist("photos") or request.FILES.getlist("photo") or request.FILES.getlist("accomplishment_photos")
    if not files:
        return JsonResponse({"error": "No files uploaded."}, status=400)

    allowed_exts = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
    max_bytes = 8 * 1024 * 1024  # 8MB per image

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
        if size > max_bytes:
            return JsonResponse({"error": f"File too large (max {max_bytes // (1024 * 1024)}MB)."}, status=400)

        # Keep filenames stable and avoid collisions.
        filename = f"construction_{uuid.uuid4().hex}{ext}"
        destination = uploads_dir / filename

        with destination.open("wb") as handle:
            for chunk in file.chunks():
                handle.write(chunk)

        stored.append(
            {
                "name": filename,
                "original_name": original_name,
                "url": f"/static/uploads/{filename}",
            }
        )

    if not stored:
        return JsonResponse({"error": "No valid files uploaded."}, status=400)

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
