#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Validate environment variables before proceeding
echo "Validating deployment environment..."
python check_deployment.py

# Run migrations
python manage.py migrate

# Collect static files (needed for Admin/Swagger)
python manage.py collectstatic --noinput --clear

# Start Gunicorn
# Workers = (2 * CPU) + 1. We use 4 as a safe default for small containers.
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4