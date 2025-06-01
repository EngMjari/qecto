# survey/models.py
from django.db import models
from django.conf import settings
from projects.models import Project
from django.utils.text import slugify
import os


class SurveyStatus(models.TextChoices):
    INITIAL_REQUEST = 'initial_request', 'درخواست اولیه'
    FIELD_SURVEY = 'field_survey', 'برداشت میدانی'
    DRAWING = 'drawing', 'ترسیم نقشه'
    COMPLETED = 'completed', 'اتمام نقشه برداری'
    RETURNED_FOR_INFO = 'returned_for_info', 'بازگشت برای تکمیل اطلاعات'


def survey_attachment_upload_path(instance, filename):
    project_title = slugify(instance.survey_project.project.title)
    return os.path.join('survey_attachments', project_title, filename)


class SurveyProject(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='survey')
    status = models.CharField(
        max_length=32, choices=SurveyStatus.choices, default=SurveyStatus.INITIAL_REQUEST)
    assigned_admin = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                       on_delete=models.SET_NULL, related_name='assigned_survey_projects')
    description = models.TextField(blank=True, null=True)
    area = models.FloatField(null=True, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_project_name(self):
        return f"{self.project.title}"

    def delete(self, *args, **kwargs):
        project = self.project
        super().delete(*args, **kwargs)
        if project:
            project.delete()

    def __str__(self):
        return f"Survey of {self.project.title} - {self.get_status_display()}"


class SurveyAttachment(models.Model):
    survey_project = models.ForeignKey(
        SurveyProject, on_delete=models.CASCADE, related_name='attachments')
    title = models.CharField(max_length=255, blank=True, default="بدون عنوان")
    file = models.FileField(upload_to=survey_attachment_upload_path)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title or f"Attachment for {self.survey_project.project.title}"
