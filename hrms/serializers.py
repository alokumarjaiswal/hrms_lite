from rest_framework import serializers
from .models import Employee, Attendance
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
import re


class EmployeeSerializer(serializers.ModelSerializer):
    total_present_days = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Employee
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "total_present_days")

    def validate_email(self, value):
        """Ensure email is in valid format"""
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        return value.lower()

    def validate_employee_id(self, value):
        """Ensure employee_id follows a reasonable format and is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Employee ID cannot be empty.")

        # Basic sanity check: alphanumeric, hyphens, underscores allowed
        if not re.match(r"^[A-Za-z0-9_-]+$", value):
            raise serializers.ValidationError(
                "Employee ID can only contain letters, numbers, hyphens, and underscores."
            )
        return value.strip().upper()

    def validate_full_name(self, value):
        """Ensure full name is not empty or just whitespace"""
        if not value or not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip()

    def validate_department(self, value):
        """Ensure department is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Department cannot be empty.")
        return value.strip()


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_id = serializers.CharField(source="employee.employee_id", read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_date(self, value):
        """Prevent marking attendance for future dates"""
        from datetime import date

        if value > date.today():
            raise serializers.ValidationError(
                "Cannot mark attendance for future dates."
            )
        return value

    def validate(self, data):
        """Additional cross-field validation"""
        # Check for duplicate attendance (employee + date combination)
        # This is redundant with the DB constraint but provides better error message
        employee = data.get("employee")
        date = data.get("date")

        if employee and date:
            # Only check if this is a create operation (no instance exists yet)
            if not self.instance:
                if Attendance.objects.filter(employee=employee, date=date).exists():
                    raise serializers.ValidationError(
                        f"Attendance for {employee.full_name} on {date} has already been marked."
                    )

        return data
