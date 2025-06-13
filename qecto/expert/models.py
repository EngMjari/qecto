# expert/models.py
import uuid
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from projects.models import Project
from attachments.models import Attachment
from core.models import User


class ExpertEvaluationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('rejected', 'رد شده'),
        ('incomplete', 'ناقص'),
    ]

    PROPERTY_TYPE_CHOICES = [
        ('field', 'زمین'),
        ('building', 'ساختمان'),
        ('other', 'سایر'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='expert_request')
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='expert_requests')
    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_expert_requests'
    )
    area = models.FloatField("مساحت (متر مربع)", null=True, blank=True)
    building_area = models.FloatField(
        "مساحت بنا (متر مربع)", null=True, blank=True,
        help_text="فقط در صورتی که نوع ملک 'ساختمان' باشد وارد شود.")
    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE_CHOICES, default='field')
    main_parcel_number = models.IntegerField(
        "پلاک اصلی", null=True, blank=True)
    sub_parcel_number = models.IntegerField("پلاک فرعی", null=True, blank=True)
    status = models.CharField(
        "وضعیت", max_length=20, choices=STATUS_CHOICES, default='pending')
    location_lat = models.FloatField("عرض جغرافیایی", null=True, blank=True)
    location_lng = models.FloatField("طول جغرافیایی", null=True, blank=True)
    description = models.TextField("توضیحات", blank=True)
    attachments = GenericRelation(Attachment)
    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)
    updated_at = models.DateTimeField("تاریخ به‌روزرسانی", auto_now=True)

    class Meta:
        verbose_name = "درخواست کارشناسی"
        verbose_name_plural = "درخواست‌های کارشناسی"

    def __str__(self):
        return f"درخواست کارشناسی - {self.project.title}"
