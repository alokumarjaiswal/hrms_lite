from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # We keep this simple now, but we OWN the table.
    # If we need 'is_hr_manager' later, we add it here.
    pass
