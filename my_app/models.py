import os
import uuid

from django.conf import settings
from django.db import models


def user_profile_picture_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower() or '.png'
    return f'user_profiles/{instance.user_id}/{uuid.uuid4().hex}{extension}'

KEY_ADMIN = 'admin'
KEY_PLANNING = 'planning'
KEY_CONSTRUCTION = 'construction'
KEY_QUALITY = 'quality'
KEY_MAINTENANCE = 'maintenance'
DIVISION_KEY_CHOICES = [
    (KEY_ADMIN, 'Admin Division'),
    (KEY_PLANNING, 'Planning Division'),
    (KEY_CONSTRUCTION, 'Construction Division'),
    (KEY_QUALITY, 'Quality Division'),
    (KEY_MAINTENANCE, 'Maintenance Division'),
    ]
class UserProfile(models.Model):
    APPEARANCE_LIGHT = 'light'
    APPEARANCE_SYSTEM = 'system'
    APPEARANCE_DARK = 'dark'
    APPEARANCE_CHOICES = [
        (APPEARANCE_LIGHT, 'Light'),
        (APPEARANCE_SYSTEM, 'System'),
        (APPEARANCE_DARK, 'Dark'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to=user_profile_picture_path, blank=True)
    email_notifications = models.BooleanField(default=True)
    portal_notifications = models.BooleanField(default=True)
    appearance_mode = models.CharField(max_length=10, choices=APPEARANCE_CHOICES, default=APPEARANCE_LIGHT)
    updated_at = models.DateTimeField(auto_now=True)

    # addition
    division = models.CharField(
        max_length=20,
        choices=DIVISION_KEY_CHOICES,
        blank = True,
        null = True 
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.get_username()} profile'


class DivisionStore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='division_stores',
    )
    key = models.CharField(max_length=20, choices=DIVISION_KEY_CHOICES)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'key'], name='unique_division_store_per_user'),
        ]

    def __str__(self):
        return f'{self.user.get_username()} {self.key} store'


class SharedDivisionStore(models.Model):
    # Global store per division key (shared across users).
    KEY_CHOICES =DIVISION_KEY_CHOICES

    key = models.CharField(max_length=20, choices=KEY_CHOICES, unique=True)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.key} shared store'
