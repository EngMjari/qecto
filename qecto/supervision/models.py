# supervision/models.py :
import uuid
from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from projects.models import Project
from attachments.models import Attachment
from core.utils import generate_tracking_code_base
import datetime
from core.models import AdminUser
User = get_user_model()


class SupervisionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('rejected', 'رد شده'),
        ('incomplete', 'ناقص'),
    ]

    SUPERVISION_TYPE_CHOICES = [
        ('architecture', 'نظارت معماری'),
        ('civil', 'نظارت عمران'),
        ('coordinator', 'ناظر هماهنگ‌کننده'),
        ('mechanical', 'نظارت مکانیک'),
        ('electrical', 'نظارت برق'),
    ]
    tracking_code = models.CharField(
        max_length=20, unique=True, blank=True, null=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='supervision_requests')
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='supervision_requests')
    assigned_admin = models.ForeignKey(
        AdminUser,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_supervision_requests'
    )
    supervision_type = models.CharField(
        max_length=20, choices=SUPERVISION_TYPE_CHOICES)

    description = models.TextField(null=True, blank=True)
    area = models.FloatField(null=True, blank=True,
                             verbose_name="مساحت زمین (متر مربع)")
    building_area = models.FloatField(
        verbose_name="مساحت بنا (متر مربع)")  # null=True حذف شد چون اجباریه
    permit_number = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="شماره پروانه")

    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    attachments = GenericRelation(
        Attachment, related_query_name='supervision_request')

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    property_type = models.CharField(
        max_length=20, default="building", null=True, blank=True)

    class Meta:
        verbose_name = "درخواست نظارت"
        verbose_name_plural = "درخواست‌های نظارت"

    def __str__(self):
        return f"{self.get_supervision_type_display()} - {self.project.title}"

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            with transaction.atomic():
                # شمارش درخواست‌های امروز برای اپ survey
                count = SupervisionRequest.objects.filter(
                    created_at__date=datetime.datetime.now().date()
                ).count() + 1
                tracking_code = generate_tracking_code_base(
                    'supervision', count)
                # بررسی منحصربه‌فرد بودن
                while SupervisionRequest.objects.filter(tracking_code=tracking_code).exists():
                    count += 1
                    tracking_code = generate_tracking_code_base(
                        'supervision', count)
                self.tracking_code = tracking_code
        super().save(*args, **kwargs)
