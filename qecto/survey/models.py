# survey/models.py :
from django.db import models
from django.conf import settings
from projects.models import Project
from django.utils.text import slugify
import os
import re
import unicodedata
import uuid
import shutil


class SurveyStatus(models.TextChoices):
    INITIAL_REQUEST = 'initial_request', 'درخواست اولیه'
    FIELD_SURVEY = 'field_survey', 'برداشت میدانی'
    DRAWING = 'drawing', 'ترسیم نقشه'
    COMPLETED = 'completed', 'اتمام نقشه برداری'
    RETURNED_FOR_INFO = 'returned_for_info', 'بازگشت برای تکمیل اطلاعات'


def slugify_fa(value):
    value = str(value).strip()
    value = unicodedata.normalize('NFKD', value)
    value = re.sub(r'[^\w\s-]', '', value, flags=re.U)
    value = re.sub(r'[-\s]+', '-', value, flags=re.U)
    return value.lower()


def survey_attachment_upload_to(instance, filename):
    # دسترسی به پروژه از طریق survey_project
    project = instance.survey_project.project if instance.survey_project else None

    project_title = project.title if project else "untitled"
    safe_title = slugify_fa(project_title)
    folder_name = f'{safe_title}_{instance.survey_project.id if instance.survey_project else "unknown"}'

    return f'survey_attachments/{folder_name}/{filename}'


class SurveyProject(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('rejected', 'رد شده'),
        ('incomplete', 'ناقص'),
    ]
    PROPERTY_TYPE = [
        ('field', 'زمین'),
        ('Building', 'ساختمان'),
        ('other', 'سایر'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='survey')
    status = models.CharField(
        max_length=32, choices=SurveyStatus.choices, default=SurveyStatus.INITIAL_REQUEST)
    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL, related_name='assigned_survey_projects')
    description = models.TextField(blank=True, null=True)
    area = models.FloatField("مساحت (متر مربع)", null=True, blank=True)
    main_parcel_number = models.IntegerField(
        "پلاک اصلی", null=True, blank=True)
    sub_parcel_number = models.IntegerField("پلاک فرعی", null=True, blank=True)
    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE, default='field')

    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    def delete(self, *args, **kwargs):
        # حذف تمام فایل‌های ضمیمه
        for attachment in self.attachments.all():
            attachment.delete()

        # پیدا کردن پوشه‌ی اصلی پروژه از روی اولین فایل
        first_attachment = self.attachments.first()
        if first_attachment and first_attachment.file:
            project_folder = os.path.dirname(
                os.path.dirname(first_attachment.file.path))
            super().delete(*args, **kwargs)
            # اگر پوشه پروژه خالی بود، حذفش کن
            if os.path.isdir(project_folder) and not os.listdir(project_folder):
                try:
                    shutil.rmtree(project_folder)
                except Exception as e:
                    print(
                        f"Error removing survey project folder {project_folder}: {e}")
        else:
            super().delete(*args, **kwargs)

    def get_project_name(self):
        return f"{self.project.title}"

    def __str__(self):
        return f"Survey of {self.project.title} - {self.get_status_display()}"


class SurveyAttachment(models.Model):
    survey_project = models.ForeignKey(
        SurveyProject, on_delete=models.CASCADE, related_name='attachments')
    title = models.CharField(max_length=255, blank=True, default="بدون عنوان")
    file = models.FileField(upload_to=survey_attachment_upload_to)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            file_dir = os.path.dirname(self.file.path)
            os.remove(self.file.path)
            if not os.listdir(file_dir):
                shutil.rmtree(file_dir)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title or f"Attachment for {self.survey_project.project.title}"
