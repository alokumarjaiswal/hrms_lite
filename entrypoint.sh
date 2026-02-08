#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Validate environment variables only if not in local development
if [ "${DEBUG}" != "1" ]; then
    echo "Validating deployment environment..."
    python check_deployment.py
fi

# Run migrations
python manage.py migrate

# Collect static files (needed for Admin/Swagger)
python manage.py collectstatic --noinput --clear

# Start Gunicorn
# Workers = (2 * CPU) + 1. We use 4 as a safe default for small containers.
# Bind to PORT environment variable provided by Render (defaults to 8000 for local dev)
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 4