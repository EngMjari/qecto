import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from projects.models import Project
from attachments.models import Attachment


class ExpertEvaluationRequest(models.Model):
    """
    مدل درخواست کارشناسی پروژه
    - هر پروژه فقط یک درخواست کارشناسی داره (OneToOne)
    - شامل وضعیت، نوع ملک، پلاک‌ها، مساحت و توضیحات
    - دارای مختصات جغرافیایی و امکان پیوست فایل‌ها
    """
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
        Project, on_delete=models.CASCADE, related_name='expert_evaluation')

    area = models.FloatField("مساحت (متر مربع)", null=True, blank=True)
    property_type = models.CharField(
        "نوع ملک", max_length=20, choices=PROPERTY_TYPE_CHOICES, default='field')

    main_parcel_number = models.IntegerField("پلاک اصلی")
    sub_parcel_number = models.IntegerField("پلاک فرعی")

    status = models.CharField(
        "وضعیت", max_length=20, choices=STATUS_CHOICES, default='pending')

    location_lat = models.FloatField("عرض جغرافیایی", null=True, blank=True)
    location_lng = models.FloatField("طول جغرافیایی", null=True, blank=True)

    description = models.TextField("توضیحات", blank=True)

    attachments = GenericRelation(Attachment)

    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)

    class Meta:
        verbose_name = "درخواست کارشناسی"
        verbose_name_plural = "درخواست‌های کارشناسی"

    def __str__(self):
        return f"درخواست کارشناسی - {self.project.title}"
