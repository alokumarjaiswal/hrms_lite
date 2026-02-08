# HRMS Lite

A lightweight employee and attendance management system with a REST API backend and modern web interface.

## Project Overview

HRMS Lite is a full-stack application for managing employee records and tracking daily attendance. The system provides CRUD operations for employee management, individual and bulk attendance marking, real-time dashboard analytics, and comprehensive reporting with date range and status filters. Built as a RESTful API with a responsive single-page application frontend.

## Tech Stack

### Backend

- Django 5.0 with Django REST Framework
- PostgreSQL (database)
- Gunicorn (WSGI server)
- Docker and Docker Compose
- WhiteNoise (static file serving)
- drf-spectacular (OpenAPI documentation)

### Frontend

- React 19 with TypeScript
- Vite (build tool and dev server)
- TanStack Query (server state management)
- Tailwind CSS (styling)
- Axios (HTTP client)
- React Router (routing)

## Local Development Setup

### Backend

The backend runs in Docker containers with PostgreSQL.

```bash
docker-compose up --build
```

The API server will be available at `http://localhost:8000`. API documentation is accessible at `http://localhost:8000/api/docs/`.

### Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```
VITE_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Assumptions and Limitations

- No authentication system (assumes single admin user)
- Binary attendance status only (PRESENT or ABSENT, no half-day or leave types)
- Timezone hardcoded to Asia/Kolkata (IST)
- Department field is simple text, not a relational model
- No role-based access control
- PostgreSQL required (no support for alternative databases)
