# survey/models.py
from django.db import models
from django.conf import settings
from projects.models import Project
from attachments.models import Attachment
from django.contrib.contenttypes.fields import GenericRelation
import uuid
from core.models import User
from requests.utils import generate_tracking_code


class SurveyRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('rejected', 'رد شده'),
        ('incomplete', 'ناقص'),
    ]

    PROPERTY_TYPE = [
        ('field', 'زمین'),
        ('building', 'ساختمان'),
        ('other', 'سایر'),
    ]
    tracking_code = models.CharField(
        max_length=20, unique=True, blank=True, null=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='survey_request'
    )
    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_survey_requests'
    )
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='survey_requests')
    description = models.TextField(blank=True, null=True)
    area = models.FloatField("مساحت (متر مربع)", null=True, blank=True)
    building_area = models.FloatField(
        "مساحت بنا (متر مربع)", null=True, blank=True,
        help_text="فقط در صورتی که نوع ملک 'ساختمان' باشد وارد شود."
    )
    main_parcel_number = models.IntegerField(
        "پلاک اصلی", null=True, blank=True)
    sub_parcel_number = models.IntegerField("پلاک فرعی", null=True, blank=True)
    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE, default='field')

    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    attachments = GenericRelation(Attachment)

    def __str__(self):
        return f"درخواست نقشه‌برداری برای {self.project.title} - {self.get_status_display()}"

    class Meta:
        verbose_name = 'نقشه برداری'
        verbose_name_plural = 'نقشه برداری ها'

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            self.tracking_code = generate_tracking_code('survey', str(self.id))
        super().save(*args, **kwargs)
