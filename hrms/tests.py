from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Employee, Attendance
import datetime

User = get_user_model()


class HRMSTests(APITestCase):
    def setUp(self):
        # No authentication required per assignment specification
        # "Assume a single admin user (no authentication required)"

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
        """Test dashboard endpoint returns correct statistics"""
        url = reverse("dashboard-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_employees", response.data)
        self.assertIn("today_stats", response.data)
        self.assertEqual(response.data["total_employees"], 1)
        self.assertIn("present", response.data["today_stats"])
        self.assertIn("absent", response.data["today_stats"])
        self.assertIn("unmarked", response.data["today_stats"])

    def test_employee_email_validation(self):
        """Test that invalid email addresses are rejected"""
        url = reverse("employee-list")
        data = {
            "employee_id": "EMP-003",
            "full_name": "Invalid Email User",
            "email": "not-an-email",
            "department": "IT",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_employee_required_fields(self):
        """Test that all required fields are validated"""
        url = reverse("employee-list")

        # Missing employee_id
        data = {
            "full_name": "Test User",
            "email": "test@example.com",
            "department": "IT",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("employee_id", response.data)

        # Missing full_name
        data = {
            "employee_id": "EMP-004",
            "email": "test@example.com",
            "department": "IT",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full_name", response.data)

        # Missing email
        data = {"employee_id": "EMP-004", "full_name": "Test User", "department": "IT"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

        # Missing department
        data = {
            "employee_id": "EMP-004",
            "full_name": "Test User",
            "email": "test@example.com",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("department", response.data)

    def test_empty_fields_rejected(self):
        """Test that empty strings are rejected for required fields"""
        url = reverse("employee-list")
        data = {
            "employee_id": "   ",
            "full_name": "   ",
            "email": "test@example.com",
            "department": "   ",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_employee_id_rejected(self):
        """Test that duplicate employee_id is rejected"""
        url = reverse("employee-list")
        data = {
            "employee_id": "EMP-001",  # Already exists from setUp
            "full_name": "Duplicate User",
            "email": "duplicate@example.com",
            "department": "HR",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_rejected(self):
        """Test that duplicate email is rejected"""
        url = reverse("employee-list")
        data = {
            "employee_id": "EMP-005",
            "full_name": "Duplicate Email User",
            "email": "john@example.com",  # Already exists from setUp
            "department": "HR",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_future_attendance_prevented(self):
        """Test that attendance cannot be marked for future dates"""
        url = reverse("attendance-list")
        future_date = datetime.date.today() + datetime.timedelta(days=1)
        data = {
            "employee": self.employee.id,
            "date": future_date,
            "status": "PRESENT",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)

    def test_attendance_required_fields(self):
        """Test that attendance requires all fields"""
        url = reverse("attendance-list")

        # Missing employee
        data = {"date": datetime.date.today(), "status": "PRESENT"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("employee", response.data)

        # Missing date
        data = {"employee": self.employee.id, "status": "PRESENT"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)

        # Missing status
        data = {"employee": self.employee.id, "date": datetime.date.today()}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_invalid_attendance_status(self):
        """Test that invalid attendance status is rejected"""
        url = reverse("attendance-list")
        data = {
            "employee": self.employee.id,
            "date": datetime.date.today(),
            "status": "INVALID_STATUS",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_employees(self):
        """Test listing all employees"""
        url = reverse("employee-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_delete_employee(self):
        """Test deleting an employee"""
        url = reverse("employee-detail", kwargs={"pk": self.employee.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Employee.objects.count(), 0)

    def test_list_attendance_records(self):
        """Test listing attendance records"""
        Attendance.objects.create(
            employee=self.employee, date=datetime.date.today(), status="PRESENT"
        )
        url = reverse("attendance-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
