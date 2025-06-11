import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from attachments.models import Attachment
from projects.models import Project


class RegistrationRequest(models.Model):
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

    OWNERSHIP_STATUS_CHOICES = [
        ('shared_deed', 'سند مشاعی'),
        ('normal_purchase', 'خریداری عادی'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='registration_request'
    )

    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE_CHOICES, default='field'
    )

    ownership_status = models.CharField(
        "وضعیت مالکیت", max_length=20, choices=OWNERSHIP_STATUS_CHOICES
    )

    area = models.FloatField("مساحت زمین (متر مربع)", null=True, blank=True)

    building_area = models.FloatField(
        "مساحت بنا (متر مربع)", null=True, blank=True,
        help_text="فقط در صورتی که نوع ملک 'ساختمان' باشد وارد شود."
    )

    location_lat = models.FloatField("عرض جغرافیایی", null=True, blank=True)
    location_lng = models.FloatField("طول جغرافیایی", null=True, blank=True)

    description = models.TextField("توضیحات", blank=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )

    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)

    attachments = GenericRelation(Attachment)

    class Meta:
        verbose_name = "درخواست اخذ سند"
        verbose_name_plural = "درخواست‌های اخذ سند"

    def __str__(self):
        return f"درخواست اخذ سند - {self.project.title}"
