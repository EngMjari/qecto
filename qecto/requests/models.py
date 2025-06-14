# requests/models.py
from django.db import models


class TrackingCode(models.Model):
    APP_CHOICES = (
        ('SURVEY', 'Survey'),
        ('SUPERVISION', 'Supervision'),
        ('EXPERT', 'Expert'),
        ('EXECUTION', 'Execution'),
        ('REGISTRATION', 'Registration'),
    )
    tracking_code = models.CharField(max_length=20, unique=True)
    app_name = models.CharField(max_length=20, choices=APP_CHOICES)
    request_id = models.CharField(max_length=36)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return self.tracking_code
