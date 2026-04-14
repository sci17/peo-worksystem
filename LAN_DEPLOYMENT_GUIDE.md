# PEO Worksystem - LAN Deployment Guide

## System Information
- **Host IP**: 192.168.1.177
- **Web Access**: http://192.168.1.177:8000
- **Admin Panel**: http://192.168.1.177:8000/admin/

## Quick Start

### 1. Start the System
```bash
cd C:\Users\Administrator\Desktop\peo-worksystem
docker compose up -d
```

### 2. Verify Services
```bash
# Check all containers are running
docker compose ps

# Expected output:
# NAME                   STATUS
# peo-worksystem-web-1   Up (healthy)
# peo-worksystem-db-1    Up (healthy)
# peo-worksystem-nginx-1 Up (healthy)
```

### 3. Access the Application
- **From this machine**: http://localhost:8000
- **From LAN**: http://192.168.1.177:8000
- **Admin panel**: http://192.168.1.177:8000/admin/

## Configuration

### Edit Settings (.env file)
Located at: `C:\Users\Administrator\Desktop\peo-worksystem\.env`

Key variables:
- `DJANGO_ALLOWED_HOSTS` — Add other LAN IPs as needed
- `DJANGO_SECRET_KEY` — Change to a secure random value
- `DJANGO_DB_PASSWORD` — Update default password
- `MYSQL_ROOT_PASSWORD` — Update default password

### After changing .env
```bash
docker compose down
docker compose up -d
```

## Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f db
docker compose logs -f nginx
```

### Stop Services
```bash
docker compose down
```

### Stop but keep data
```bash
docker compose stop
```

### Restart Services
```bash
docker compose restart
```

### Rebuild Image (after code changes)
```bash
docker compose up -d --build
```

## Database Access

### From Host Machine
```bash
# Using MySQL CLI
mysql -h 127.0.0.1 -u django_user -p peo_database

# Using Docker
docker exec -it peo-worksystem-db-1 mysql -u django_user -p peo_database
```

### Connection Details
- **Host**: db (internal) or 127.0.0.1 (external)
- **Port**: 3306
- **Username**: django_user
- **Password**: django_pass (default)
- **Database**: peo_database

## Application Management

### Run Django Commands
```bash
# Create superuser
docker compose exec web python manage.py createsuperuser

# Collect static files
docker compose exec web python manage.py collectstatic --noinput

# Run migrations
docker compose exec web python manage.py migrate

# Access Django shell
docker compose exec web python manage.py shell
```

### Check Application Health
```bash
# Direct URL
curl http://localhost:8000/healthz

# From another LAN machine
curl http://192.168.1.177:8000/healthz

# Should return: "healthy"
```

## Storage Locations

All data is stored in Docker volumes:

- **Database**: `peo-worksystem_mysql_data` volume
- **Static files**: `peo-worksystem_django_static` volume
- **Media files**: `peo-worksystem_django_media` volume
- **Cache**: `peo-worksystem_django_cache` volume

To view volume details:
```bash
docker volume ls
docker volume inspect peo-worksystem_mysql_data
```

## Backup & Restore

### Backup Database
```bash
docker exec peo-worksystem-db-1 mysqldump -u django_user -p peo_database > backup.sql
# Enter password: django_pass
```

### Restore Database
```bash
docker exec -i peo-worksystem-db-1 mysql -u django_user -p peo_database < backup.sql
# Enter password: django_pass
```

### Backup Volumes
```bash
# Backup all volumes
docker run --rm -v peo-worksystem_mysql_data:/data -v C:\backups:/backup alpine tar czf /backup/mysql_data.tar.gz -C /data .
docker run --rm -v peo-worksystem_django_media:/data -v C:\backups:/backup alpine tar czf /backup/django_media.tar.gz -C /data .
docker run --rm -v peo-worksystem_django_static:/data -v C:\backups:/backup alpine tar czf /backup/django_static.tar.gz -C /data .
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it in `docker-compose.yml`:
```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Change 8000 to 8080
```

### Out of Memory Errors
Increase Docker Desktop memory:
- Settings → Resources → Memory: Set to 4GB or higher

### Database Connection Refused
```bash
# Restart database service
docker compose restart db

# Wait 30 seconds for healthcheck to pass
docker compose ps
```

### Static Files Not Loading
```bash
# Collect static files
docker compose exec web python manage.py collectstatic --noinput
```

### Clear All Data and Start Fresh
```bash
# WARNING: This deletes all data
docker compose down -v
docker compose up -d
```

## Network Sharing

To access from other LAN computers:

1. **Find your machine's LAN IP**:
   ```bash
   ipconfig | findstr IPv4
   ```

2. **Add to DJANGO_ALLOWED_HOSTS** in `.env`:
   ```
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.177,192.168.1.*
   ```

3. **Restart services**:
   ```bash
   docker compose down && docker compose up -d
   ```

4. **Access from other machine**:
   ```
   http://192.168.1.177:8000
   ```

5. **Verify network connectivity**:
   ```bash
   ping 192.168.1.177
   ```

## Security Notes

⚠️ This setup is suitable for **development and LAN-only use**:

For production deployment over internet:
- Change all default passwords in `.env`
- Enable HTTPS/SSL (use nginx with Let's Encrypt)
- Set `DJANGO_DEBUG=False`
- Use strong `DJANGO_SECRET_KEY`
- Restrict `DJANGO_ALLOWED_HOSTS` to specific domains
- Use a proper reverse proxy (nginx with SSL)
- Enable firewall rules
- Set up regular backups

## Next Steps

1. ✅ Start the system: `docker compose up -d`
2. ✅ Access web app: http://192.168.1.177:8000
3. ✅ Create Django superuser: `docker compose exec web python manage.py createsuperuser`
4. ✅ Access admin: http://192.168.1.177:8000/admin/
5. ✅ Share with LAN users via IP address

## Support

For issues:
1. Check logs: `docker compose logs -f`
2. Verify containers: `docker compose ps`
3. Test connectivity: `curl -v http://192.168.1.177:8000/healthz`
