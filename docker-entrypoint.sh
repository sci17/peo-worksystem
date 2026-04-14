#!/bin/sh
set -e

mkdir -p "${DJANGO_MEDIA_ROOT:-/shared/media}" /app/staticfiles /app/.cache/django

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
