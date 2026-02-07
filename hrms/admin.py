from django.contrib import admin
from .models import Employee, Attendance


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Employee admin with search and filtering capabilities"""

    list_display = ("employee_id", "full_name", "email", "department", "created_at")
    list_filter = ("department", "created_at")
    search_fields = (
        "employee_id",
        "full_name",
        "email",
        "department",
    )  # For autocomplete
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Attendance admin with filtering by date and status"""

    list_display = ("employee", "date", "status", "created_at")
    list_filter = ("status", "date", "created_at")
    search_fields = ("employee__employee_id", "employee__full_name")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-date",)
    date_hierarchy = "date"
    autocomplete_fields = ("employee",)
