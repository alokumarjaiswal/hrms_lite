from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    # Strict permissions: Only Admin/Staff can manage employees
    permission_classes = [permissions.IsAdminUser]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAdminUser]

    # Bonus: Filter by date (built-in to DRF logic if we add filter_backends)
    def get_queryset(self):
        queryset = super().get_queryset()
        date_param = self.request.query_params.get("date")
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
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
