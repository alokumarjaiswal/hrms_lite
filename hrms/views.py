from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db.models import Count, Q
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    # Assignment specifies: "Assume a single admin user (no authentication required)"
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Annotate employees with total present days count"""
        return Employee.objects.annotate(
            total_present_days=Count(
                "attendance_records", filter=Q(attendance_records__status="PRESENT")
            )
        ).all()


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    # Assignment specifies: "Assume a single admin user (no authentication required)"
    permission_classes = [permissions.AllowAny]

    # Bonus: Filter by date (built-in to DRF logic if we add filter_backends)
    def get_queryset(self):
        queryset = super().get_queryset()
        date_param = self.request.query_params.get("date")
        status_param = self.request.query_params.get("status")
        employee_param = self.request.query_params.get("employee")

        if date_param:
            queryset = queryset.filter(date=date_param)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if employee_param:
            queryset = queryset.filter(employee=employee_param)

        return queryset


class DashboardStatsView(APIView):
    # Assignment specifies: "Assume a single admin user (no authentication required)"
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Get today's date in the configured timezone (IST)
        today = timezone.localtime(timezone.now()).date()
        total_employees = Employee.objects.count()

        # Efficiently count status for today without looping
        attendance_stats = Attendance.objects.filter(date=today).aggregate(
            present=Count("id", filter=Q(status="PRESENT")),
            absent=Count("id", filter=Q(status="ABSENT")),
        )

        return Response(
            {
                "total_employees": total_employees,
                "today_stats": {
                    "date": today,
                    "present": attendance_stats["present"],
                    "absent": attendance_stats["absent"],
                    "unmarked": total_employees
                    - (attendance_stats["present"] + attendance_stats["absent"]),
                },
            }
        )


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """
    Health check endpoint for deployment monitoring.
    Returns 200 OK with status information.
    """
    return Response(
        {
            "status": "healthy",
            "version": "1.0.0",
            "service": "hrms-lite-backend",
        }
    )
