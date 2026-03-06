from django.urls import path

from . import views

urlpatterns = [
    path('', views.user_dashboard, name='user_dashboard'),
    path('admin-division/', views.admin_division_dashboard, name='admin_division_dashboard'),
    path('planning-division/', views.planning_division_dashboard, name='planning_division_dashboard'),
    path('construction-division/', views.construction_division_dashboard, name='construction_division_dashboard'),
    path('maintenance/road-management/', views.road_management, name='road_management'),
    path('maintenance/contractor-management/', views.contractor_management, name='contractor_management'),
    path('maintenance/task-management/', views.task_management, name='task_management'),
]
