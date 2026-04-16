"""
Django Channels routing for WebSocket connections
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/files/update/$', consumers.FileUpdateConsumer.as_asgi()),
    re_path(r'ws/user/activity/$', consumers.UserActivityConsumer.as_asgi()),
    re_path(r'ws/division-store/$', consumers.DivisionStoreConsumer.as_asgi()),
]
