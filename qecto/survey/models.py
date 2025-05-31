# survey/models.py
from django.db import models
from django.conf import settings
from projects.models import Project

class SurveyStatus(models.TextChoices):
    INITIAL_REQUEST = 'initial_request', 'درخواست اولیه'
    FIELD_SURVEY = 'field_survey', 'برداشت میدانی'
    DRAWING = 'drawing', 'ترسیم نقشه'
    COMPLETED = 'completed', 'اتمام نقشه برداری'
    RETURNED_FOR_INFO = 'returned_for_info', 'بازگشت برای تکمیل اطلاعات'

class SurveyProject(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='survey')
    status = models.CharField(max_length=32, choices=SurveyStatus.choices, default=SurveyStatus.INITIAL_REQUEST)
    assigned_admin = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_survey_projects')
    description = models.TextField(blank=True, null=True)
    area = models.FloatField(null=True, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Survey of {self.project.title} - {self.get_status_display()}"

class SurveyAttachment(models.Model):
    survey_project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='survey_attachments/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.survey_project.project.title}"
