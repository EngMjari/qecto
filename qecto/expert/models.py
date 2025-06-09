# expert/models.py :
from django.db import models
from django.conf import settings
from projects.models import Project
from django.utils.text import slugify
import os
import shutil
import re
import unicodedata
import uuid


def slugify_fa(value):
    value = str(value).strip()
    value = unicodedata.normalize('NFKD', value)
    value = re.sub(r'[^\w\s-]', '', value, flags=re.U)
    value = re.sub(r'[-\s]+', '-', value, flags=re.U)
    return value.lower()


def expert_attachment_upload_to(instance, filename):
    project = instance.project.project if instance.project else None
    project_title = project.title if project else "untitled"
    safe_title = slugify_fa(project_title)
    folder_name = f'{safe_title}_{instance.project.id if instance.project else "unknown"}'

    return f'expert_attachments/{folder_name}/{filename}'


class ExpertEvaluationProject(models.Model):
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
        Project, on_delete=models.CASCADE, related_name='expert_evaluation')
    area = models.FloatField("مساحت (متر مربع)", null=True, blank=True)
    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE, default='field')
    main_parcel_number = models.IntegerField("پلاک اصلی")
    sub_parcel_number = models.IntegerField("پلاک فرعی")

    status = status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    location_lat = models.FloatField("عرض جغرافیایی", null=True, blank=True)
    location_lng = models.FloatField("طول جغرافیایی", null=True, blank=True)

    description = models.TextField("توضیحات", blank=True)
    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)

    def __str__(self):
        return f"درخواست کارشناسی - {self.project.title}"

    def delete(self, *args, **kwargs):
        # حذف ضمیمه‌ها
        for attachment in self.attachments.all():
            attachment.delete()

        # پیدا کردن پوشه اصلی پروژه از روی اولین ضمیمه
        first_attachment = self.attachments.first()
        if first_attachment and first_attachment.file:
            project_folder = os.path.dirname(
                os.path.dirname(first_attachment.file.path))
            super().delete(*args, **kwargs)
            if os.path.isdir(project_folder) and not os.listdir(project_folder):
                try:
                    shutil.rmtree(project_folder)
                except Exception as e:
                    print(
                        f"Error removing expert project folder {project_folder}: {e}")
        else:
            super().delete(*args, **kwargs)

        # در نهایت حذف پروژه اصلی
        if self.project:
            self.project.delete()


class ExpertAttachment(models.Model):
    project = models.ForeignKey(
        ExpertEvaluationProject,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="درخواست کارشناسی"
    )
    title = models.CharField("عنوان فایل", max_length=255,
                             blank=True, default="بدون عنوان")
    file = models.FileField("فایل", upload_to=expert_attachment_upload_to)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="آپلودکننده"
    )
    uploaded_at = models.DateTimeField("تاریخ آپلود", auto_now_add=True)

    def __str__(self):
        return self.title or f"پیوست برای {self.project.project.title}"

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            file_dir = os.path.dirname(self.file.path)
            os.remove(self.file.path)
            if not os.listdir(file_dir):
                shutil.rmtree(file_dir)
        super().delete(*args, **kwargs)
