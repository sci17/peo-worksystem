from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.db import models

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
DIVISION_STAFF_GROUP_NAME_BY_KEY = {
    KEY_ADMIN: "Admin Division Staff Engineer",
    KEY_PLANNING: "Planning Division Staff Engineer",
    KEY_CONSTRUCTION: "Construction Division Staff Engineer",
    KEY_QUALITY: "Quality Division Staff Engineer",
    KEY_MAINTENANCE: "Maintenance Division Staff Engineer",
}
DIVISION_EDIT_GROUP_ALIASES_BY_KEY = {
    KEY_ADMIN: {
        "Admin Division Staff Engineer",
        "Admin Engineer Staff",
    },
    KEY_PLANNING: {
        "Planning Division Staff Engineer",
        "Planning Division Engineer Staff",
        "Planning Division Staff",
    },
    KEY_CONSTRUCTION: {
        "Construction Division Staff Engineer",
        "Construction Engineer Staff",
    },
    KEY_QUALITY: {
        "Quality Division Staff Engineer",
        "Quality Division Engineer Staff",
        "Quality Control Division Staff Engineer",
    },
    KEY_MAINTENANCE: {
        "Maintenance Division Staff Engineer",
        "Maintenance Division Engineer Staff",
        "Maintenance Division Staff",
    },
}
DIVISION_GROUP_NAME_ALIASES = {
    "quality division": "quality control division",
    "maitenance division": "maintenance division",
    "maitenance": "maintenance",
    "quality control": "quality",
    "admin_division": "admin division",
    "planning_division": "planning division",
    "construction_division": "construction division",
    "quality_division": "quality division",
    "quality_control_division": "quality control division",
    "maintenance_division": "maintenance division",
    "admin engineer staff": "admin division staff engineer",
    "construction engineer staff": "construction division staff engineer",
    "planning division staff": "planning division staff engineer",
    "maintenance division staff": "maintenance division staff engineer",
    "quality division staff engineer": "quality division staff engineer",
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
        "admin division staff engineer": KEY_ADMIN,
        "planning division staff engineer": KEY_PLANNING,
        "construction division staff engineer": KEY_CONSTRUCTION,
        "quality division staff engineer": KEY_QUALITY,
        "quality control division staff engineer": KEY_QUALITY,
        "maintenance division staff engineer": KEY_MAINTENANCE,
        "admin_division": KEY_ADMIN,
        "planning_division": KEY_PLANNING,
        "construction_division": KEY_CONSTRUCTION,
        "quality_division": KEY_QUALITY,
        "quality_control_division": KEY_QUALITY,
        "maintenance_division": KEY_MAINTENANCE,
        "admin": KEY_ADMIN,
        "planning": KEY_PLANNING,
        "construction": KEY_CONSTRUCTION,
        "quality": KEY_QUALITY,
        "quality control": KEY_QUALITY,
        "maintenance": KEY_MAINTENANCE,
        "maitenance": KEY_MAINTENANCE,
    }
    return aliases.get(text, "")


def _division_label_for_key(value):
    labels = {
        KEY_ADMIN: "Admin Division",
        KEY_PLANNING: "Planning Division",
        KEY_CONSTRUCTION: "Construction Division",
        KEY_QUALITY: "Quality Division",
        KEY_MAINTENANCE: "Maintenance Division",
    }
    return labels.get(_normalize_division_key(value), "")


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

    primary_group_name = DIVISION_GROUP_NAME_BY_KEY[key]
    staff_group_name = DIVISION_STAFF_GROUP_NAME_BY_KEY[key]
    primary_group, _ = Group.objects.get_or_create(name=primary_group_name)
    staff_group, _ = Group.objects.get_or_create(name=staff_group_name)

    division_group_names = set(DIVISION_GROUP_NAME_BY_KEY.values()) | set(DIVISION_STAFF_GROUP_NAME_BY_KEY.values())
    legacy_staff_group_names = {
        str(name or "").strip()
        for alias_names in DIVISION_EDIT_GROUP_ALIASES_BY_KEY.values()
        for name in alias_names
        if str(name or "").strip()
    }
    division_group_names |= legacy_staff_group_names

    allowed_group_names = {primary_group.name}
    if getattr(user, "is_staff", False):
        allowed_group_names.add(staff_group.name)

    other_groups = Group.objects.filter(name__in=division_group_names).exclude(name__in=allowed_group_names)
    if other_groups.exists():
        user.groups.remove(*list(other_groups))

    user.groups.add(primary_group)
    if getattr(user, "is_staff", False):
        user.groups.add(staff_group)


User = get_user_model()

MAIN_DIVISION_ACCOUNT_IDENTITIES = {
    "admin_division": {
        "emails": set(),
    },
    "planning_division": {
        "emails": set(),
    },
    "construction_division": {
        "emails": {"engr.elmon@gmail.com"},
    },
    "maintenance_division": {
        "emails": set(),
    },
    "quality_control": {
        "emails": set(),
    },
}


def _is_main_division_account(user):
    if not user or getattr(user, "is_superuser", False):
        return False
    username = str(getattr(user, "username", "") or "").strip().lower()
    email = str(getattr(user, "email", "") or "").strip().lower()
    if username in MAIN_DIVISION_ACCOUNT_IDENTITIES:
        return True
    return any(email and email in identity.get("emails", set()) for identity in MAIN_DIVISION_ACCOUNT_IDENTITIES.values())


class UserAccountTypeFilter(admin.SimpleListFilter):
    title = "account type"
    parameter_name = "account_type"

    def lookups(self, request, model_admin):
        return (
            ("superadmin", "Super Admin"),
            ("main_division_account", "Main Division Account"),
            ("staff_user", "Staff User"),
            ("portal_user", "Portal User"),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "superadmin":
            return queryset.filter(is_superuser=True)
        if value == "main_division_account":
            usernames = sorted(MAIN_DIVISION_ACCOUNT_IDENTITIES.keys())
            emails = sorted({email for identity in MAIN_DIVISION_ACCOUNT_IDENTITIES.values() for email in identity.get("emails", set())})
            if emails:
                return queryset.filter(is_superuser=False).filter(models.Q(username__in=usernames) | models.Q(email__in=emails))
            return queryset.filter(is_superuser=False, username__in=usernames)
        if value == "staff_user":
            usernames = sorted(MAIN_DIVISION_ACCOUNT_IDENTITIES.keys())
            emails = sorted({email for identity in MAIN_DIVISION_ACCOUNT_IDENTITIES.values() for email in identity.get("emails", set())})
            queryset = queryset.filter(is_superuser=False, is_staff=True).exclude(username__in=usernames)
            if emails:
                queryset = queryset.exclude(email__in=emails)
            return queryset
        if value == "portal_user":
            return queryset.filter(is_superuser=False, is_staff=False)
        return queryset


class UserDivisionFilter(admin.SimpleListFilter):
    title = "assigned division"
    parameter_name = "assigned_division"

    def lookups(self, request, model_admin):
        return (
            (KEY_ADMIN, "Admin Division"),
            (KEY_PLANNING, "Planning Division"),
            (KEY_CONSTRUCTION, "Construction Division"),
            (KEY_QUALITY, "Quality Division"),
            (KEY_MAINTENANCE, "Maintenance Division"),
            ("unassigned", "Unassigned"),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "unassigned":
            return queryset.filter(profile__division__isnull=True)
        if value:
            return queryset.filter(profile__division=value)
        return queryset


try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "email",
        "account_type_label",
        "assigned_division_label",
        "is_staff",
        "is_superuser",
        "is_active",
        "last_login",
    )
    list_filter = (
        UserAccountTypeFilter,
        UserDivisionFilter,
        "is_active",
        "is_staff",
        "is_superuser",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("profile")

    @admin.display(description="Account Type")
    def account_type_label(self, obj):
        if obj.is_superuser:
            return "Super Admin"
        if _is_main_division_account(obj):
            return "Main Division Account"
        if obj.is_staff:
            return "Staff User"
        return "Portal User"

    @admin.display(description="Assigned Division")
    def assigned_division_label(self, obj):
        profile = getattr(obj, "profile", None)
        division = getattr(profile, "division", "") if profile else ""
        return _division_label_for_key(division) or "Unassigned"


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
