"""
Django Channels WebSocket consumers for real-time file updates
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from django.contrib.auth.models import User


class FileUpdateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time file update notifications
    Broadcasts file changes to all connected clients
    """
    
    async def connect(self):
        """Accept WebSocket connection and add to group"""
        self.user = self.scope["user"]
        self.room_name = 'file_updates'
        self.room_group_name = f'file_updates_{self.room_name}'
        
        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial file list
        await self.send_initial_files()
    
    async def disconnect(self, close_code):
        """Remove from group on disconnect"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_files':
                await self.send_initial_files()
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': str(__import__('datetime').datetime.now()),
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def file_update(self, event):
        """Handle file update broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'file_update',
            'files': event.get('files'),
            'timestamp': event.get('timestamp'),
        }))
    
    async def file_change(self, event):
        """Handle file change notification"""
        changes = event.get('changes', {})
        
        if changes.get('added') or changes.get('deleted') or changes.get('modified'):
            await self.send(text_data=json.dumps({
                'type': 'file_change',
                'added': changes.get('added', []),
                'deleted': changes.get('deleted', []),
                'modified': changes.get('modified', []),
                'timestamp': changes.get('timestamp'),
            }))
    
    async def file_notify(self, event):
        """Handle file notification"""
        notification = event.get('notification', {})
        await self.send(text_data=json.dumps({
            'type': 'file_notify',
            'filename': notification.get('filename'),
            'uploader': notification.get('uploader'),
            'size': notification.get('size'),
            'timestamp': notification.get('timestamp'),
        }))
    
    async def send_initial_files(self):
        """Send current file list to client"""
        files = await database_sync_to_async(
            lambda: cache.get('file_list', [])
        )()
        
        await self.send(text_data=json.dumps({
            'type': 'initial_files',
            'files': files,
        }))


class UserActivityConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for user activity tracking
    Shows who is online and what they're doing
    """
    
    async def connect(self):
        """Accept connection and add to activity group"""
        self.user = self.scope["user"]
        self.room_group_name = 'user_activity'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify others that user is online
        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_online',
                    'username': self.user.username,
                    'timestamp': str(__import__('datetime').datetime.now()),
                }
            )
    
    async def disconnect(self, close_code):
        """Remove from group and notify others"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_offline',
                    'username': self.user.username,
                    'timestamp': str(__import__('datetime').datetime.now()),
                }
            )
    
    async def receive(self, text_data):
        """Receive activity update"""
        try:
            data = json.loads(text_data)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_activity',
                    'username': self.user.username,
                    'activity': data.get('activity'),
                    'timestamp': str(__import__('datetime').datetime.now()),
                }
            )
        except json.JSONDecodeError:
            pass
    
    async def user_online(self, event):
        """Send user online notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'username': event['username'],
            'timestamp': event['timestamp'],
        }))
    
    async def user_offline(self, event):
        """Send user offline notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'username': event['username'],
            'timestamp': event['timestamp'],
        }))
    
    async def user_activity(self, event):
        """Send user activity notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_activity',
            'username': event['username'],
            'activity': event['activity'],
            'timestamp': event['timestamp'],
        }))
