# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create staticfiles directory and change ownership of app directory
RUN mkdir -p /app/staticfiles && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Render will map this dynamically)
EXPOSE 8000

# Run entrypoint script
CMD ["sh", "entrypoint.sh"]