from django.contrib import admin
from django.contrib.auth.models import Group

from .models import (
    UserProfile,
    SharedDivisionStore,
    DivisionStore,
    DivisionStoreEvent,
    ConstructionUpload,
    KEY_ADMIN,
    KEY_PLANNING,
    KEY_CONSTRUCTION,
    KEY_QUALITY,
    KEY_MAINTENANCE,
)


DIVISION_GROUP_NAME_BY_KEY = {
    KEY_ADMIN: "Admin Division",
    KEY_PLANNING: "Planning Division",
    KEY_CONSTRUCTION: "Construction Division",
    KEY_QUALITY: "Quality Control Division",
    KEY_MAINTENANCE: "Maintenance Division",
}
DIVISION_GROUP_NAME_ALIASES = {
    "quality division": "quality control division",
    "maitenance division": "maintenance division",
    "maitenance": "maintenance",
    "quality control": "quality",
}


def _normalize_division_key(value):
    text = str(value or "").strip().lower()
    if not text:
        return ""

    aliases = {
        "admin division": KEY_ADMIN,
        "planning division": KEY_PLANNING,
        "construction division": KEY_CONSTRUCTION,
        "quality division": KEY_QUALITY,
        "quality control division": KEY_QUALITY,
        "maintenance division": KEY_MAINTENANCE,
        "maitenance division": KEY_MAINTENANCE,
        "admin": KEY_ADMIN,
        "planning": KEY_PLANNING,
        "construction": KEY_CONSTRUCTION,
        "quality": KEY_QUALITY,
        "quality control": KEY_QUALITY,
        "maintenance": KEY_MAINTENANCE,
        "maitenance": KEY_MAINTENANCE,
    }
    return aliases.get(text, "")


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
        return ""

    group_key = _division_key_from_groups(user)
    profile_key = str(getattr(profile, "division", "") or "").strip()
    if group_key and profile_key and group_key != profile_key:
        return ""
    return group_key or profile_key


def _sync_user_division_group(user, division_key):
    key = _normalize_division_key(division_key)
    if key not in DIVISION_GROUP_NAME_BY_KEY:
        return

    target_name = DIVISION_GROUP_NAME_BY_KEY[key]
    target_group, _ = Group.objects.get_or_create(name=target_name)

    division_group_names = set(DIVISION_GROUP_NAME_BY_KEY.values())
    other_groups = Group.objects.filter(name__in=division_group_names).exclude(name=target_group.name)
    if other_groups.exists():
        user.groups.remove(*list(other_groups))

    user.groups.add(target_group)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user','division','updated_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
    list_filter = ('division',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj and getattr(obj, "user_id", None) and getattr(obj, "division", None):
            _sync_user_division_group(obj.user, obj.division)

# addition
@admin.register(DivisionStore)
class DivisionStoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'updated_at')
    list_filter = ('key',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs

        user_division = _get_user_division_key(request.user)
        if not user_division:
            return qs.none()
        return qs.filter(key=user_division)
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if not super().has_change_permission(request, obj=obj):
            return False

        if obj is None:
            return True

        user_division = _get_user_division_key(request.user)
        return bool(user_division) and obj.key == user_division
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if not super().has_delete_permission(request, obj=obj):
            return False

        if obj is None:
            return True

        user_division = _get_user_division_key(request.user)
        return bool(user_division) and obj.key == user_division
        
    def save_model(self,request,obj,form,change):
        if not request.user.is_superuser:
            user_division = _get_user_division_key(request.user)
            if user_division:
                obj.key = user_division
        super().save_model(request, obj, form, change)

@admin.register(SharedDivisionStore)
class SharedDivisionStoreAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        user_division = _get_user_division_key(request.user)
        if not user_division:
            return qs.none()
        return qs.filter(key=user_division)

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if not super().has_change_permission(request, obj=obj):
            return False

        if obj is None:
            return True

        user_division = _get_user_division_key(request.user)
        return bool(user_division) and obj.key == user_division

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if not super().has_delete_permission(request, obj=obj):
            return False

        if obj is None:
            return True

        user_division = _get_user_division_key(request.user)
        return bool(user_division) and obj.key == user_division


@admin.register(DivisionStoreEvent)
class DivisionStoreEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "store_key", "target", "actor", "write_mode", "method", "path")
    list_filter = ("store_key", "target", "write_mode", "method")
    search_fields = ("actor__username", "actor__first_name", "actor__last_name", "path")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ConstructionUpload)
class ConstructionUploadAdmin(admin.ModelAdmin):
    list_display = ("created_at", "uploaded_by", "original_name", "stored_name", "size_bytes", "content_type")
    list_filter = ("content_type", "created_at")
    search_fields = ("original_name", "stored_name", "uploaded_by__username")
    ordering = ("-created_at",)
