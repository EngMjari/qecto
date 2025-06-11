from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class TicketSession(models.Model):
    SESSION_TYPE_CHOICES = [
        ('survey', 'نقشه‌برداری'),
        ('execution', 'پیاده‌سازی'),
        ('expert', 'کارشناسی'),
        ('registration', 'ثبت سند'),
        ('supervision', 'نظارت'),
        ('general', 'عمومی'),
    ]

    STATUS_CHOICES = [
        ('open', 'باز'),
        ('closed', 'بسته'),
        ('auto_closed', 'بسته خودکار'),
    ]

    REPLY_STATUS_CHOICES = [
        ('waiting_for_admin', 'در انتظار پاسخ ادمین'),
        ('answered', 'پاسخ داده شده'),
    ]

    LAST_MESSAGE_BY_CHOICES = [
        ('user', 'کاربر'),
        ('admin', 'ادمین'),
    ]

    title = models.CharField(max_length=100)
    session_type = models.CharField(
        max_length=20, choices=SESSION_TYPE_CHOICES)

    # ارتباط عمومی با یکی از مدل‌های درخواست
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        limit_choices_to={
            'model__in': [
                'surveyrequest',
                'executionrequest',
                'expertevaluationrequest',
                'registrationrequest',
                'supervisionrequest',
            ]
        }
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_request = GenericForeignKey('content_type', 'object_id')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ticket_sessions'
    )

    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_ticket_sessions'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    reply_status = models.CharField(
        max_length=20,
        choices=REPLY_STATUS_CHOICES,
        default='waiting_for_admin'
    )

    last_message_by = models.CharField(
        max_length=10,
        choices=LAST_MESSAGE_BY_CHOICES,
        null=True,
        blank=True
    )

    closed_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.get_session_type_display()} - {getattr(self.user, 'phone_number', str(self.user))}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(
        TicketSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    message = models.TextField()
    attachment = models.FileField(
        upload_to='ticket_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"پیام توسط {self.sender} در {self.created_at}"
