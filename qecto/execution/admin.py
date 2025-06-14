from django.contrib import admin
from .models import ExecutionRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1
    readonly_fields = ('uploaded_at', 'uploaded_by')
    fields = ('title', 'file', 'uploaded_at', 'uploaded_by')
    verbose_name = "پیوست"
    verbose_name_plural = "پیوست‌ها"


@admin.register(ExecutionRequest)
class ExecutionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'assigned_admin',
        'status',
        'building_area',
        'attachment_count',  # نمایش تعداد پیوست‌ها
        'created_at',
        'updated_at',

    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = (
        'project__title',
        'assigned_admin__full_name',
        'permit_number',
    )
    autocomplete_fields = ('project', 'assigned_admin')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                'project',
                'assigned_admin',
                'status',
                'description',
                ('area', 'building_area'),
                'permit_number',
                ('location_lat', 'location_lng'),
                'created_at',
                'updated_at',
                'property_type',
                'tracking_code',
            )
        }),
    )

    inlines = [AttachmentInline]

    def attachment_count(self, obj):
        return obj.attachments.count()
    attachment_count.short_description = 'تعداد پیوست‌ها'
