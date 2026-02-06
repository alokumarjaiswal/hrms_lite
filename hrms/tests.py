from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Employee, Attendance
import datetime

User = get_user_model()


class HRMSTests(APITestCase):
    def setUp(self):
        # Create Admin User (Since our APIs require IsAdminUser)
        self.user = User.objects.create_superuser(
            username="admin", password="password123"
        )
        self.client.force_authenticate(user=self.user)

        # Setup Data
        self.employee = Employee.objects.create(
            employee_id="EMP-001",
            full_name="John Doe",
            email="john@example.com",
            department="IT",
        )

    def test_create_employee(self):
        url = reverse("employee-list")
        data = {
            "employee_id": "EMP-002",
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "department": "HR",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)

    def test_mark_attendance(self):
        url = reverse("attendance-list")
        data = {
            "employee": self.employee.id,
            "date": datetime.date.today(),
            "status": "PRESENT",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_attendance_prevented(self):
        """Ensure an employee cannot be marked twice for the same day"""
        today = datetime.date.today()
        Attendance.objects.create(employee=self.employee, date=today, status="PRESENT")

        url = reverse("attendance-list")
        data = {"employee": self.employee.id, "date": today, "status": "ABSENT"}
        response = self.client.post(url, data, format="json")
        # DRF Standard behavior for IntegrityError is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_stats(self):
        url = reverse("dashboard-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_employees", response.data)
