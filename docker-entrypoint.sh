#!/bin/sh
set -e

mkdir -p "${DJANGO_MEDIA_ROOT:-/shared/media}" /app/staticfiles /app/.cache/django

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  python manage.py migrate --noinput
fi

if [ "${COLLECT_STATIC:-false}" = "true" ]; then
  python manage.py collectstatic --noinput
fi

exec "$@"
