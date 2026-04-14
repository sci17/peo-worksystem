"""
Celery Beat periodic task schedule for PEO Worksystem
"""
from celery.schedules import crontab

# Celery Beat Schedule
CELERY_BEAT_SCHEDULE = {
    # Sync file metadata every 5 seconds
    'sync-file-metadata': {
        'task': 'my_site.tasks.sync_file_metadata',
        'schedule': 5.0,  # Every 5 seconds
        'options': {'queue': 'default'}
    },
    
    # Scan for file changes every 10 seconds
    'scan-file-changes': {
        'task': 'my_site.tasks.scan_file_changes',
        'schedule': 10.0,  # Every 10 seconds
        'options': {'queue': 'default'}
    },
    
    # Sync database with files every hour
    'sync-database-with-files': {
        'task': 'my_site.tasks.sync_database_with_files',
        'schedule': 3600.0,  # Every 1 hour
        'options': {'queue': 'default'}
    },
    
    # Cleanup old files daily at 2 AM
    'cleanup-old-files': {
        'task': 'my_site.tasks.cleanup_old_files',
        'schedule': crontab(hour=2, minute=0),
        'options': {'queue': 'default'}
    },
}
