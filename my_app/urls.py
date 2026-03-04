from django.urls import path

from . import views

urlpatterns = [
    path('', views.user_dashboard, name='user_dashboard'),
    path('admin-division/', views.admin_division_dashboard, name='admin_division_dashboard'),
]
