from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectType(models.TextChoices):
    SURVEY = 'survey', 'نقشه‌برداری'
    DEED = 'deed', 'دریافت سند'
    SUPERVISION = 'supervision', 'نظارت'
    EXECUTION = 'execution', 'اجرا'

class ProjectStatus(models.TextChoices):
    PENDING = 'pending', 'در انتظار ارجاع'
    ASSIGNED = 'assigned', 'ارجاع داده‌شده'
    REJECTED = 'rejected', 'ردشده یا نیاز به اصلاح'
    IN_PROGRESS = 'in_progress', 'در حال انجام'
    COMPLETED = 'completed', 'اتمام‌یافته'

class Project(models.Model):
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_projects')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_projects')

    project_type = models.CharField(max_length=20, choices=ProjectType.choices)
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_project_type_display()})"

class ProjectAttachment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='project_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.project.title}"
