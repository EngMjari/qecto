from django.db import models
from projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class ExecutionProject(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='execution')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_executions')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='execution_assigned')
    status = models.CharField(
        max_length=50,
        choices=[
            ('initial_request', 'درخواست اولیه'),
            ('materials_ready', 'آماده‌سازی مصالح'),
            ('in_progress', 'در حال اجرا'),
            ('inspection', 'بازرسی'),
            ('completed', 'اتمام کار'),
            ('rejected', 'رد شده'),
        ],
        default='initial_request'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"اجرای پروژه - {self.project}"
