# User Account Management - PEO Worksystem

## Current User Accounts

| Username | Email | Role | Password |
|----------|-------|------|----------|
| admin | admin@peo-worksystem.local | Administrator | admin@123 |
| john_doe | john.doe@company.com | Regular User | John@2025 |
| maria_santos | maria.santos@company.com | Regular User | Maria@2025 |
| james_smith | james.smith@company.com | Regular User | James@2025 |

---

## Access the Application

**Web App URL:** http://192.168.1.177:8000

**Admin Panel:** http://192.168.1.177:8000/admin/
- Username: `admin`
- Password: `admin@123`

---

## User Roles

### Administrator (admin)
- ✅ Create/edit/delete documents
- ✅ Manage all users
- ✅ Access admin panel
- ✅ Change system settings
- ✅ View all reports

### Regular Users (john_doe, maria_santos, james_smith)
- ✅ Upload documents
- ✅ Download documents
- ✅ View shared documents
- ✅ Edit own profile
- ❌ Cannot manage other users
- ❌ Cannot access admin panel

---

## Managing Users via Django Admin

### Create New User
1. Login to admin: http://192.168.1.177:8000/admin/
2. Click "Users" → "Add User"
3. Enter username and password
4. Click Save
5. Edit to set email and permissions

### Edit User
1. Admin panel → Users
2. Click username to edit
3. Modify details:
   - Email
   - First/Last name
   - Permissions (Staff, Superuser)
   - Active status
4. Click Save

### Delete User
1. Admin panel → Users
2. Click username
3. Scroll to bottom
4. Click "Delete" (red button)
5. Confirm

### Change User Password
1. Admin panel → Users
2. Click username
3. Under "Password", click "Change password"
4. Enter new password twice
5. Click Save

---

## Managing Users via Command Line

### Create New User
```bash
docker compose exec web python manage.py createsuperuser
# Or for regular user:
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.create_user(
    username='new_user',
    email='new@example.com',
    password='SecurePass123'
)
print(f'Created: {user.username}')
EOF
```

### List All Users
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
for user in User.objects.all():
    role = "Admin" if user.is_superuser else ("Staff" if user.is_staff else "User")
    print(f"{user.username} ({user.email}) - {role}")
EOF
```

### Change User Password
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='admin')
user.set_password('new_password_here')
user.save()
print(f'Password updated for {user.username}')
EOF
```

### Delete User
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='username_to_delete')
user.delete()
print('User deleted')
EOF
```

### Make User Admin
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='john_doe')
user.is_staff = True
user.is_superuser = True
user.save()
print(f'{user.username} is now Administrator')
EOF
```

### Backup User Data
```bash
docker compose exec web python manage.py dumpdata auth.user --indent=2 > users_backup.json
```

### Restore User Data
```bash
docker compose exec web python manage.py loaddata users_backup.json
```

---

## Password Policy

### Current Passwords (Change These!)
⚠️ The default passwords are simple for easy access during setup.

### Change All Passwords
1. Each user should change their password on first login
2. Or admin can change via admin panel
3. Users can change own password at: http://192.168.1.177:8000/change-password/

### Strong Password Guidelines
- Minimum 12 characters
- Mix uppercase and lowercase
- Include numbers and symbols
- No dictionary words
- Example: `Secure@Pass2025!`

---

## Authentication

### First Time Login
1. Open http://192.168.1.177:8000
2. Click "Login"
3. Enter username and password
4. Click "Sign In"

### Change Your Password
1. Logged in → Click profile icon (top right)
2. Click "Change Password"
3. Enter old password
4. Enter new password twice
5. Click "Update Password"

### Reset Forgotten Password
If user forgets password, admin can:
1. Go to admin panel
2. Find user
3. Click "Change password" link
4. Set temporary password
5. User logs in and changes it themselves

---

## User Activity & Permissions

### View Login History
Admin can check last login:
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
for user in User.objects.all():
    last_login = user.last_login or "Never"
    print(f"{user.username}: Last login = {last_login}")
EOF
```

### Check User Groups (Permissions)
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='john_doe')
print(f"Groups: {user.groups.all()}")
print(f"Is Staff: {user.is_staff}")
print(f"Is Superuser: {user.is_superuser}")
EOF
```

---

## Bulk User Management

### Create Multiple Users from CSV
Create file `users.csv`:
```csv
username,email,password,is_staff
alice,alice@company.com,Pass@2025,false
bob,bob@company.com,Pass@2025,false
carol,carol@company.com,Pass@2025,true
```

Run script:
```bash
docker compose exec web python shell << EOF
import csv
from django.contrib.auth.models import User

with open('users.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not User.objects.filter(username=row['username']).exists():
            User.objects.create_user(
                username=row['username'],
                email=row['email'],
                password=row['password'],
                is_staff=row['is_staff'] == 'true'
            )
            print(f"Created: {row['username']}")
EOF
```

---

## Disable/Deactivate Users

### Deactivate User (Keep Data)
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='john_doe')
user.is_active = False
user.save()
print(f'{user.username} deactivated')
EOF
```

### Reactivate User
```bash
docker compose exec web python shell << EOF
from django.contrib.auth.models import User
user = User.objects.get(username='john_doe')
user.is_active = True
user.save()
print(f'{user.username} reactivated')
EOF
```

---

## Data Preservation

✅ **All User Data is Safe**
- User accounts stored in MySQL database
- Passwords hashed with Django security
- No data deleted during updates
- Automatic database backups available

### Backup Users
```bash
# Export all users
docker compose exec web python manage.py dumpdata auth.user --indent=2 > user_backup.json

# Export all data
docker compose exec web python manage.py dumpdata > complete_backup.json
```

### Restore Users
```bash
# Restore from backup
docker compose exec web python manage.py loaddata user_backup.json
```

---

## File Permissions

User's uploaded files are accessible based on:
1. **Owner** — Can always access own files
2. **Shared files** — All users can access files in public folder
3. **Admin** — Can access all files

Configure in Django admin:
- Permissions → Document Permissions
- Set who can view/edit/delete each document

---

## Security Notes

### Do This:
✅ Change default passwords after first login
✅ Use strong passwords (12+ characters)
✅ Regularly review user accounts
✅ Deactivate unused accounts
✅ Keep backups of user data

### Don't Do This:
❌ Share passwords via email/chat
❌ Use simple passwords like "123456"
❌ Give admin access to everyone
❌ Store passwords in plaintext files
❌ Skip password changes

---

## Quick Commands Summary

```bash
# Create admin
docker compose exec web python manage.py createsuperuser

# List all users
docker compose exec web python manage.py shell -c "from django.contrib.auth.models import User; [print(f'{u.username} - {u.email}') for u in User.objects.all()]"

# Backup database
docker exec peo-worksystem-db-1 mysqldump -u django_user -p peo_database > backup.sql

# View logs
docker compose logs web

# Restart services
docker compose restart
```

---

## Support

For user account issues:
1. Check admin panel for account status
2. Verify database connection: `docker compose logs db`
3. Reset password via admin if needed
4. Check file permissions in Django admin
5. Review user activity logs

All existing user data is preserved and protected in the MySQL database!
