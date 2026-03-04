from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect
from django.shortcuts import render


@login_required
def user_dashboard(request):
<<<<<<< HEAD
    return render(request, 'Dashboard/dashboard.html')
=======
    return render(request, 'admin/admin.html')


@login_required
def admin_division_dashboard(request):
    return render(request, 'admin/admin.html')
>>>>>>> b8f7e1dbeb1848a46ffc65437ab67fa66bcc6499


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
