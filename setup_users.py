#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_site.settings')
django.setup()

from django.contrib.auth.models import User

users_data = [
    {'username': 'admin', 'email': 'admin@peo.local', 'password': 'admin@123', 'is_staff': True, 'is_superuser': True},
    {'username': 'john_doe', 'email': 'john@company.com', 'password': 'John@2025', 'is_staff': False, 'is_superuser': False},
    {'username': 'maria_santos', 'email': 'maria@company.com', 'password': 'Maria@2025', 'is_staff': False, 'is_superuser': False},
    {'username': 'james_smith', 'email': 'james@company.com', 'password': 'James@2025', 'is_staff': False, 'is_superuser': False},
]

print("Creating users...")
for user_data in users_data:
    if not User.objects.filter(username=user_data['username']).exists():
        User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],
            is_staff=user_data['is_staff'],
            is_superuser=user_data['is_superuser'],
        )
        print(f'✓ Created: {user_data["username"]}')
    else:
        print(f'✓ Exists: {user_data["username"]}')

print('\nAll Users:')
for user in User.objects.all():
    role = "Admin" if user.is_superuser else ("Staff" if user.is_staff else "User")
    print(f'  {user.username} ({user.email}) - {role}')
