"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from hrms.views import (
    EmployeeViewSet,
    AttendanceViewSet,
    DashboardStatsView,
    health_check,
)


def api_root(request):
    """Root endpoint with API information"""
    return JsonResponse(
        {
            "message": "HRMS Lite API",
            "version": "1.0.0",
            "status": "operational",
            "endpoints": {
                "health": "/health/",
                "api_docs": "/api/docs/",
                "dashboard": "/api/dashboard/",
                "employees": "/api/employees/",
                "attendance": "/api/attendance/",
            },
        }
    )


router = DefaultRouter()
router.register(r"employees", EmployeeViewSet)
router.register(r"attendance", AttendanceViewSet)

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    # Health check endpoint (no /api/ prefix for simplicity)
    path("health/", health_check, name="health-check"),
    path("api/", include(router.urls)),
    # OpenAPI Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/dashboard/", DashboardStatsView.as_view(), name="dashboard-stats"),
]
