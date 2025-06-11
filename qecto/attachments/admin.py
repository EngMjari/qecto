from django.contrib import admin
from .models import Attachment
from django.utils.html import format_html
from django.contrib.contenttypes.models import ContentType


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = (
        'title_display',
        'file_link',
        'uploaded_by',
        'uploaded_at',
        'parent_object_display',
        'content_type',
    )
    list_filter = ('uploaded_at', 'content_type')
    search_fields = ('title', 'uploaded_by__username', 'file')

    readonly_fields = ('uploaded_at', 'file_link', 'content_object')

    def file_link(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">دانلود</a>', obj.file.url)
        return "-"
    file_link.short_description = "دانلود فایل"

    def title_display(self, obj):
        return obj.title or "بدون عنوان"
    title_display.short_description = "عنوان فایل"

    def parent_object_display(self, obj):
        try:
            return str(obj.content_object)
        except Exception:
            return "نامشخص"
    parent_object_display.short_description = "شیء والد"
