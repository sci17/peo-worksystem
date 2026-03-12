from django.urls import path

from . import views

urlpatterns = [
    path('', views.user_dashboard, name='user_dashboard'),
    path('tracking-details/', views.tracking_details, name='tracking_details'),
    path('account/settings/', views.account_settings, name='account_settings'),
    path('admin-division/', views.admin_division_dashboard, name='admin_division_dashboard'),
    path('admin-division/submissions/', views.admin_division_submissions, name='admin_division_submissions'),
    path('planning-division/', views.planning_division_dashboard, name='planning_division_dashboard'),
    path('planning-division/submissions/', views.planning_division_submissions, name='planning_division_submissions'),
    path('quality-division/', views.quality_division_dashboard, name='quality_division_dashboard'),
    path('quality-division/submissions/', views.quality_division_submissions, name='quality_division_submissions'),
    path('projects/', views.project_dashboard, name='project_dashboard'),
    path('construction-division/', views.construction_division_dashboard, name='construction_division_dashboard'),
    path('construction-division/submissions/', views.construction_division_submissions, name='construction_division_submissions'),
    path('construction-division/project/', views.construction_project_dashboard, name='construction_project_dashboard'),
    path('maintenance/road-management/', views.road_management, name='road_management'),
    path('maintenance/contractor-management/', views.contractor_management, name='contractor_management'),
    path('maintenance/task-management/', views.task_management, name='task_management'),
    path('maintenance/submissions/', views.maintenance_division_submissions, name='maintenance_division_submissions'),
    path('api/division-store/<slug:key>/', views.division_store_api, name='division_store_api'),
    path('api/uploads/construction/', views.construction_photo_upload, name='construction_photo_upload'),
]
