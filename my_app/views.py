from django.contrib.auth import login
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from .forms import AccountSettingsForm
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

    if request.user.get_full_name().strip() and profile.profile_picture:
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
        context.setdefault('overview_active_projects', 0)
        context.setdefault('overview_active_projects_delta', '')
        context.setdefault('overview_active_projects_progress', 0)
        context.setdefault('overview_pending_approvals', 0)
        context.setdefault('overview_pending_approvals_delta', '')
        context.setdefault('overview_pending_approvals_progress', 0)
        context.setdefault('overview_recent_updates', 0)
        context.setdefault('overview_recent_updates_delta', '')
        context.setdefault('overview_recent_updates_progress', 0)
        context.setdefault('overview_spotlight_projects', [])
        context.setdefault('overview_leadership_executive', None)
        context.setdefault('overview_leadership_divisions', [])
        context.setdefault('overview_recent_activity', [])
        context.setdefault('overview_division_performance', [])
        context.setdefault('overview_top_performer', '')
        context.setdefault('overview_overall_efficiency', '')
        context.setdefault('overview_division_progress', [])

    return context


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
    return render(
        request,
        'Dashboard/dashboard.html',
        _build_dashboard_context(
            request,
            current_section='project',
            page_heading='Project Database',
        ),
    )


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
