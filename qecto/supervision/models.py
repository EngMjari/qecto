from django.db import models
from projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class SupervisionProject(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='supervision')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_supervisions')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervision_assigned')
    status = models.CharField(
        max_length=50,
        choices=[
            ('initial_request', 'درخواست اولیه'),
            ('review_documents', 'بررسی مدارک'),
            ('field_visit', 'بازدید میدانی'),
            ('monitoring', 'نظارت'),
            ('completed', 'اتمام کار'),
            ('rejected', 'رد شده'),
        ],
        default='initial_request'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"نظارت - {self.project}"
