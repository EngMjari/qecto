# execution/models.py
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from projects.models import Project
from attachments.models import Attachment

User = get_user_model()


class ExecutionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('rejected', 'رد شده'),
        ('incomplete', 'ناقص'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='execution_request')
    assigned_admin = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_execution_requests', verbose_name="ادمین تخصیص‌یافته")
    description = models.TextField(
        null=True, blank=True, verbose_name="توضیحات")
    area = models.FloatField(null=True, blank=True,
                             verbose_name="مساحت زمین (متر مربع)")
    building_area = models.FloatField(
        null=True, blank=True, verbose_name="مساحت بنا (متر مربع)")
    permit_number = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="شماره پروانه")
    location_lat = models.FloatField(
        null=True, blank=True, verbose_name="عرض جغرافیایی")
    location_lng = models.FloatField(
        null=True, blank=True, verbose_name="طول جغرافیایی")
    attachments = GenericRelation(
        Attachment, related_query_name='execution_request')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت")
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="تاریخ ثبت")
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="تاریخ به‌روزرسانی")

    class Meta:
        verbose_name = "درخواست اجرا"
        verbose_name_plural = "درخواست‌های اجرا"

    def __str__(self):
        return f"درخواست اجرا - {self.project.title}"
