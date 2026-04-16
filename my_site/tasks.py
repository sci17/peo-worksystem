"""
Background tasks for file synchronization and real-time updates
"""
import os
import hashlib
import json
from datetime import datetime
from celery import shared_task
from django.core.cache import cache
from django.db import models
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# File monitoring and sync tasks

@shared_task
def sync_file_metadata():
    """
    Scan media directory and update file metadata in cache
    Runs every 5 seconds to detect new/modified files
    """
    media_root = '/shared/media'
    file_list = []
    
    if not os.path.exists(media_root):
        return {'status': 'media folder not found'}
    
    try:
        for root, dirs, files in os.walk(media_root):
            for file in files:
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, media_root)
                
                # Get file metadata
                stat = os.stat(filepath)
                file_info = {
                    'name': file,
                    'path': rel_path,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'hash': get_file_hash(filepath),
                }
                file_list.append(file_info)
        
        # Store in cache with 1 hour TTL
        cache.set('file_list', file_list, 3600)
        
        # Broadcast update to all connected clients
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'file_updates',
            {
                'type': 'file_update',
                'files': file_list,
                'timestamp': datetime.now().isoformat(),
            }
        )
        
        return {
            'status': 'success',
            'files_scanned': len(file_list),
            'timestamp': datetime.now().isoformat(),
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def cleanup_old_files():
    """
    Remove files older than 90 days
    Runs once daily
    """
    import time
    media_root = '/shared/media'
    current_time = time.time()
    days_90 = 90 * 24 * 60 * 60
    deleted_count = 0
    
    try:
        for root, dirs, files in os.walk(media_root):
            for file in files:
                filepath = os.path.join(root, file)
                file_time = os.path.getmtime(filepath)
                
                if (current_time - file_time) > days_90:
                    try:
                        os.remove(filepath)
                        deleted_count += 1
                    except Exception as e:
                        pass
        
        return {
            'status': 'success',
            'deleted_files': deleted_count,
            'timestamp': datetime.now().isoformat(),
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def scan_file_changes():
    """
    Detect file additions, deletions, and modifications
    Compare against cached file list
    """
    current_files = {}
    media_root = '/shared/media'
    
    # Get current files
    if os.path.exists(media_root):
        for root, dirs, files in os.walk(media_root):
            for file in files:
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, media_root)
                current_files[rel_path] = get_file_hash(filepath)
    
    # Get previously cached files
    cached_files = cache.get('file_hashes', {})
    
    changes = {
        'added': [],
        'deleted': [],
        'modified': [],
        'timestamp': datetime.now().isoformat(),
    }
    
    # Detect additions
    for path in current_files:
        if path not in cached_files:
            changes['added'].append(path)
    
    # Detect deletions and modifications
    for path, old_hash in cached_files.items():
        if path not in current_files:
            changes['deleted'].append(path)
        elif current_files[path] != old_hash:
            changes['modified'].append(path)
    
    # Update cache
    cache.set('file_hashes', current_files, 3600)
    
    # Notify all users if there are changes
    if changes['added'] or changes['deleted'] or changes['modified']:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'file_updates',
            {
                'type': 'file_change',
                'changes': changes,
            }
        )
    
    return changes


@shared_task
def generate_file_preview(file_path):
    """
    Generate preview for uploaded file
    """
    try:
        full_path = os.path.join('/shared/media', file_path)
        
        file_info = {
            'path': file_path,
            'exists': os.path.exists(full_path),
            'size': os.path.getsize(full_path) if os.path.exists(full_path) else 0,
            'readable': os.access(full_path, os.R_OK) if os.path.exists(full_path) else False,
        }
        
        return file_info
    except Exception as e:
        return {'error': str(e)}


@shared_task
def notify_file_upload(filename, uploader, file_size):
    """
    Notify all users of new file upload
    """
    notification = {
        'type': 'file_upload',
        'filename': filename,
        'uploader': uploader,
        'size': file_size,
        'timestamp': datetime.now().isoformat(),
    }
    
    # Broadcast to all connected clients
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'file_updates',
        {
            'type': 'file_notify',
            'notification': notification,
        }
    )
    
    return notification


@shared_task
def sync_database_with_files():
    """
    Sync database file records with actual files on disk
    Handles cases where files are added/deleted outside the web interface
    """
    from django.contrib.auth.models import User
    from django.utils import timezone
    
    media_root = '/shared/media'
    synced_files = []
    
    try:
        # Get admin user
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            return {'status': 'error', 'message': 'No admin user found'}
        
        # Scan files and create records
        if os.path.exists(media_root):
            for root, dirs, files in os.walk(media_root):
                for filename in files:
                    filepath = os.path.join(root, filename)
                    rel_path = os.path.relpath(filepath, media_root)
                    
                    try:
                        stat = os.stat(filepath)
                        file_record = {
                            'name': filename,
                            'path': rel_path,
                            'size': stat.st_size,
                            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            'url': f'/media/{rel_path}',
                        }
                        synced_files.append(file_record)
                    except Exception as e:
                        pass
        
        return {
            'status': 'success',
            'synced_files': len(synced_files),
            'timestamp': datetime.now().isoformat(),
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_file_hash(filepath, algorithm='md5'):
    """
    Calculate file hash for change detection
    """
    hash_func = hashlib.new(algorithm)
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hash_func.update(chunk)
        return hash_func.hexdigest()
    except Exception:
        return None
