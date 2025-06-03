# tickets/models.py
import os
import shutil
from django.db import models
from django.conf import settings
from django.utils.text import slugify

from projects.models import Project
from expert.models import ExpertEvaluationProject
from survey.models import SurveyProject


class Ticket(models.Model):
    SUBJECT_CHOICES = [
        ('survey', 'نقشه‌برداری'),
        ('expert', 'کارشناسی'),
        ('general', 'عمومی'),
    ]

    title = models.CharField("عنوان تیکت", max_length=200)
    description = models.TextField("متن پیام")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name="ایجادکننده"
    )
    related_project = models.ForeignKey(
        Project,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name="پروژه مرتبط"
    )
    related_survey = models.ForeignKey(
        SurveyProject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name="درخواست نقشه‌برداری مرتبط"
    )
    related_expert = models.ForeignKey(
        ExpertEvaluationProject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name="درخواست کارشناسی مرتبط"
    )

    subject_type = models.CharField(
        max_length=20,
        choices=SUBJECT_CHOICES,
        default='general',
        verbose_name="نوع موضوع"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('open', 'باز'),
            ('answered', 'پاسخ داده شده'),
            ('closed', 'بسته شده'),
        ],
        default='open',
        verbose_name="وضعیت"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return f"تیکت: {self.title} توسط {self.created_by}"


def ticket_attachment_upload_to(instance, filename):
    ticket = instance.ticket

    if ticket.related_project:
        folder = f"project_{slugify(ticket.related_project.title)}_{ticket.related_project.id}"
    elif ticket.related_survey:
        folder = f"survey_{slugify(ticket.related_survey.title)}_{ticket.related_survey.id}"
    elif ticket.related_expert:
        folder = f"expert_{slugify(ticket.related_expert.title)}_{ticket.related_expert.id}"
    else:
        folder = f"general_ticket_{ticket.id}"

    return f"ticket_attachments/{folder}/{filename}"


class TicketAttachment(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="تیکت"
    )
    file = models.FileField(upload_to=ticket_attachment_upload_to, verbose_name="فایل")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="آپلودکننده"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ آپلود")

    def delete(self, *args, **kwargs):
        # حذف فایل و پوشه در صورت خالی بودن
        if self.file and os.path.isfile(self.file.path):
            file_dir = os.path.dirname(self.file.path)
            os.remove(self.file.path)
            if os.path.isdir(file_dir) and not os.listdir(file_dir):
                shutil.rmtree(file_dir)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"پیوست برای تیکت: {self.ticket.title}"


class TicketReply(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name="تیکت"
    )
    message = models.TextField("متن پاسخ")
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="پاسخ‌دهنده"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ پاسخ")

    def __str__(self):
        return f"پاسخ به: {self.ticket.title} توسط {self.replied_by}"


def ticket_reply_attachment_upload_to(instance, filename):
    reply = instance.reply
    ticket = reply.ticket

    if ticket.related_project:
        folder = f"project_{slugify(ticket.related_project.title)}_{ticket.related_project.id}"
    elif ticket.related_survey:
        folder = f"survey_{slugify(ticket.related_survey.title)}_{ticket.related_survey.id}"
    elif ticket.related_expert:
        folder = f"expert_{slugify(ticket.related_expert.title)}_{ticket.related_expert.id}"
    else:
        folder = f"general_ticket_{ticket.id}"

    return f"ticket_replies/{folder}/{filename}"


class TicketReplyAttachment(models.Model):
    reply = models.ForeignKey(
        TicketReply,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="پاسخ"
    )
    file = models.FileField(upload_to=ticket_reply_attachment_upload_to, verbose_name="فایل")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="آپلودکننده"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ آپلود")

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            file_dir = os.path.dirname(self.file.path)
            os.remove(self.file.path)
            if os.path.isdir(file_dir) and not os.listdir(file_dir):
                shutil.rmtree(file_dir)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"فایل پیوست پاسخ برای تیکت: {self.reply.ticket.title}"