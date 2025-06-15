from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
import os
import shutil
import uuid
import re
import unicodedata


def slugify_fa(value):
    value = str(value).strip()
    value = unicodedata.normalize('NFKD', value)
    value = re.sub(r'[^\w\s-]', '', value, flags=re.U)
    value = re.sub(r'[-\s]+', '-', value, flags=re.U)
    return value.lower()


def dynamic_upload_path(instance, filename):
    model_name = instance.content_type.model
    parent_obj = instance.content_object
    if model_name == 'ticketmessage':
        ticket_id = parent_obj.ticket.id
        return f'attachments/ticketmessage/ticket_{ticket_id}/{filename}'
    title = getattr(parent_obj, 'project', None)
    if title and hasattr(title, 'title'):
        title_str = title.title
    else:
        title_str = 'untitled'
    safe_title = slugify_fa(title_str)
    parent_id = getattr(parent_obj, 'id', 'unknown')
    return f'attachments/{model_name}/{safe_title}_{parent_id}/{filename}'


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        "عنوان فایل", max_length=255, blank=True, default="")
    file = models.FileField("فایل", upload_to=dynamic_upload_path)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, verbose_name="آپلودکننده"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Generic Relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey("content_type", "object_id")

    def delete(self, *args, **kwargs):
        try:
            if self.file and os.path.isfile(self.file.path):
                file_dir = os.path.dirname(self.file.path)
                os.remove(self.file.path)
                if not os.listdir(file_dir):
                    shutil.rmtree(file_dir)
        except Exception as e:
            print(f"Error deleting file {self.file.path}: {e}")
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title or f"پیوست برای {self.content_object}"

    class Meta:
        verbose_name = 'پیوست'
        verbose_name_plural = 'پیوست‌ها'
