from django.urls import path

from . import views

urlpatterns = [
    path('', views.user_dashboard, name='user_dashboard'),
    path('account/settings/', views.account_settings, name='account_settings'),
    path('admin-division/', views.admin_division_dashboard, name='admin_division_dashboard'),
    path('planning-division/', views.planning_division_dashboard, name='planning_division_dashboard'),
    path('quality-division/', views.quality_division_dashboard, name='quality_division_dashboard'),
    path('projects/', views.project_dashboard, name='project_dashboard'),
    path('construction-division/', views.construction_division_dashboard, name='construction_division_dashboard'),
    path('construction-division/project/', views.construction_project_dashboard, name='construction_project_dashboard'),
    path('maintenance/road-management/', views.road_management, name='road_management'),
    path('maintenance/contractor-management/', views.contractor_management, name='contractor_management'),
    path('maintenance/task-management/', views.task_management, name='task_management'),
    path('api/division-store/<slug:key>/', views.division_store_api, name='division_store_api'),
]
