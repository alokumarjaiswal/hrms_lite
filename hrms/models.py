import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    'created_at' and 'updated_at' fields.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Employee(TimeStampedModel):
    # UUID prevents enumeration attacks (scrapers guessing IDs)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # The requirement asks for "Employee ID". This is the business ID (e.g., EMP-001).
    employee_id = models.CharField(max_length=20, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


class Attendance(TimeStampedModel):
    STATUS_CHOICES = [
        ("PRESENT", "Present"),
        ("ABSENT", "Absent"),
    ]

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        # Prevent marking attendance twice for the same person on the same day
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} - {self.status}"
