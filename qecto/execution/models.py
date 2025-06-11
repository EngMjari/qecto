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

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='execution_requests')
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='execution_requests')
    assigned_admin = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_execution_requests')

    description = models.TextField(null=True, blank=True)
    area = models.FloatField(null=True, blank=True,
                             verbose_name="مساحت زمین (متر مربع)")
    building_area = models.FloatField(
        null=True, blank=True, verbose_name="مساحت بنا (متر مربع)")
    permit_number = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="شماره پروانه")

    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    # فایل‌ها با GenericRelation
    attachments = GenericRelation(
        Attachment, related_query_name='execution_request')

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "درخواست اجرا"
        verbose_name_plural = "درخواست‌های اجرا"

    def __str__(self):
        return f"درخواست اجرا - {self.project.title}"
