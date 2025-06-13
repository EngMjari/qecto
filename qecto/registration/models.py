# registration/models.py
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from projects.models import Project
from attachments.models import Attachment

User = get_user_model()


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
        Project, on_delete=models.CASCADE, related_name='registration_request')
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='registration_requests')
    assigned_admin = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_registration_requests', verbose_name="ادمین تخصیص‌یافته")
    property_type = models.CharField(
        max_length=20, choices=PROPERTY_TYPE_CHOICES, default='field', verbose_name="نوع ملک")
    ownership_status = models.CharField(
        max_length=20, choices=OWNERSHIP_STATUS_CHOICES, verbose_name="وضعیت مالکیت")
    area = models.FloatField(null=True, blank=True,
                             verbose_name="مساحت زمین (متر مربع)")
    building_area = models.FloatField(
        null=True, blank=True, verbose_name="مساحت بنا (متر مربع)",
        help_text="فقط در صورتی که نوع ملک 'ساختمان' باشد وارد شود.")
    main_parcel_number = models.IntegerField(
        null=True, blank=True, verbose_name="پلاک اصلی",
        help_text="فقط برای سند مشاعی وارد شود.")
    sub_parcel_number = models.IntegerField(
        null=True, blank=True, verbose_name="پلاک فرعی",
        help_text="فقط برای سند مشاعی وارد شود.")
    request_survey = models.BooleanField(
        default=False, verbose_name="درخواست همزمان نقشه‌برداری",
        help_text="تیک بزنید اگر نقشه UTM ندارید.")
    location_lat = models.FloatField(
        null=True, blank=True, verbose_name="عرض جغرافیایی")
    location_lng = models.FloatField(
        null=True, blank=True, verbose_name="طول جغرافیایی")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت")
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="تاریخ ثبت")
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="تاریخ به‌روزرسانی")
    attachments = GenericRelation(
        Attachment, related_query_name='registration_request')

    class Meta:
        verbose_name = "درخواست اخذ سند"
        verbose_name_plural = "درخواست‌های اخذ سند"

    def __str__(self):
        return f"درخواست اخذ سند - {self.project.title}"
