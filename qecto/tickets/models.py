from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


def ticket_file_upload_path(instance, filename):
    # مسیر ذخیره فایل‌ها به شکل زیر خواهد بود:
    # ticket_files/session_<شناسه سشن>/<نام فایل>
    return f'ticket_files/session_{instance.message.session.id}/{filename}'


class TicketSession(models.Model):
    SESSION_TYPE_CHOICES = [
        ('survey', 'نقشه‌برداری'),
        ('expert', 'کارشناسی'),
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

    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    
    # اگر می‌خواهید هر دو نوع درخواست را پشتیبانی کنید، 
    # بهتر است این دو FK را داشته باشید؛ یا مدل پایه برای درخواست ایجاد کنید
    survey_request = models.ForeignKey(
        'survey.SurveyProject', null=True, blank=True,
        on_delete=models.CASCADE, related_name='ticket_sessions'
    )
    evaluation_request = models.ForeignKey(
        'expert.ExpertEvaluationProject', null=True, blank=True,
        on_delete=models.CASCADE, related_name='ticket_sessions'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='ticket_sessions'
    )
    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='assigned_ticket_sessions'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    reply_status = models.CharField(max_length=20, choices=REPLY_STATUS_CHOICES, default='waiting_for_admin')
    last_message_by = models.CharField(max_length=10, choices=LAST_MESSAGE_BY_CHOICES, null=True, blank=True)
    closed_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        # شماره تلفن یا نام کاربر را می‌توانید اینجا تغییر دهید
        return f"{self.get_session_type_display()} - {getattr(self.user, 'phone_number', str(self.user))}"


class TicketMessage(models.Model):
    session = models.ForeignKey(
        TicketSession, on_delete=models.CASCADE,
        related_name='messages'
    )
    
    sender_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='sent_user_ticket_messages'
    )
    sender_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='sent_admin_ticket_messages'
    )
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # اعتبارسنجی اینکه فقط یکی از sender_user یا sender_admin مقدار داشته باشد
        if not (self.sender_user or self.sender_admin):
            raise ValidationError('یکی از فرستنده‌های کاربر یا ادمین باید مقدار داشته باشد.')
        if self.sender_user and self.sender_admin:
            raise ValidationError('فقط یکی از فرستنده‌های کاربر یا ادمین باید مقدار داشته باشد.')

    def __str__(self):
        sender_name = None
        if self.sender_user:
            sender_name = getattr(self.sender_user, 'phone_number', str(self.sender_user))
        elif self.sender_admin:
            sender_name = getattr(self.sender_admin, 'phone_number', str(self.sender_admin))
        else:
            sender_name = "مهمان"
        return f"پیام از {sender_name} در {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"


class TicketMessageFile(models.Model):
    message = models.ForeignKey(
        TicketMessage, on_delete=models.CASCADE,
        related_name='files'
    )
    file = models.FileField(upload_to=ticket_file_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def file_extension(self):
        return self.file.name.split('.')[-1].lower()

    def __str__(self):
        return self.file.name
