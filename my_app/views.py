from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect
from django.shortcuts import render


@login_required
def user_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'workflow',
            'page_heading': 'Workflow Management',
        },
    )


@login_required
def admin_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'admin',
            'page_heading': 'Admin Division',
        },
    )


@login_required
def construction_division_dashboard(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'construction',
            'page_heading': 'Construction Division',
            'construction_template': 'construction/construction.html',
        },
    )


@login_required
def road_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'maintenance',
            'current_maintenance': 'road',
            'page_heading': 'Road Management',
            'maintenance_template': 'Maintinance/includes/road_management_table.html',
        },
    )


@login_required
def contractor_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'maintenance',
            'current_maintenance': 'contractor',
            'page_heading': 'Contractor Management',
            'maintenance_template': 'Maintinance/includes/contractor_management_table.html',
        },
    )


@login_required
def task_management(request):
    return render(
        request,
        'Dashboard/dashboard.html',
        {
            'current_section': 'maintenance',
            'current_maintenance': 'task',
            'page_heading': 'Task Management',
            'maintenance_template': 'Maintinance/includes/task_management_table.html',
        },
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
