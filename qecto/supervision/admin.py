from django.contrib import admin
from .models import SupervisionRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1
    readonly_fields = ('uploaded_at', 'uploaded_by')
    fields = ('title', 'file', 'uploaded_at', 'uploaded_by')
    verbose_name = "پیوست"
    verbose_name_plural = "پیوست‌ها"


@admin.register(SupervisionRequest)
class SupervisionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'project', 'owner', 'supervision_type', 'status',
        'building_area', 'permit_number', 'attachment_count', 'created_at',
    )
    list_filter = ('status', 'supervision_type', 'created_at')
    search_fields = ('project__title', 'owner__username', 'permit_number')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('project', 'owner', 'assigned_admin')
    ordering = ('-created_at',)
    inlines = [AttachmentInline]

    fieldsets = (
        (None, {
            'fields': (
                'project', 'owner', 'assigned_admin', 'supervision_type', 'status',
                'description', 'permit_number', 'property_type',
                'tracking_code',
            )
        }),
        ('مساحت', {
            'fields': ('area', 'building_area'),
        }),
        ('موقعیت جغرافیایی', {
            'fields': ('location_lat', 'location_lng'),
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def attachment_count(self, obj):
        return obj.attachments.count()
    attachment_count.short_description = 'تعداد پیوست‌ها'
