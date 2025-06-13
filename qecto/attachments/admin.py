from django.contrib import admin
from .models import Attachment
from django.utils.html import format_html
from django.urls import reverse


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'file_link', 'uploaded_by',
        'uploaded_at', 'content_type', 'object_link',
    )
    list_filter = ('uploaded_at', 'content_type')
    search_fields = ('title', 'uploaded_by__username',
                     'uploaded_by__full_name')
    readonly_fields = ('uploaded_at', 'object_link', 'file_link')
    autocomplete_fields = ['uploaded_by']

    fieldsets = (
        (None, {
            'fields': ('title', 'file', 'uploaded_by')
        }),
        ('مربوط به', {
            'fields': ('content_type', 'object_id', 'object_link')
        }),
        ('زمان', {
            'fields': ('uploaded_at',)
        }),
    )

    def file_link(self, obj):
        if obj.file:
            return format_html(
                "<a href='{}' target='_blank'>📎 مشاهده فایل</a>", obj.file.url
            )
        return "-"
    file_link.short_description = "لینک فایل"

    def object_link(self, obj):
        if obj.content_object:
            model = obj.content_type.model
            app_label = obj.content_type.app_label
            url = reverse(
                f"admin:{app_label}_{model}_change", args=[obj.object_id])
            return format_html("<a href='{}' target='_blank'>{}</a>", url, str(obj.content_object))
        return "-"
    object_link.short_description = "آبجکت مرتبط"
