from django.contrib import admin
from .models import RegistrationRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1
    readonly_fields = ('uploaded_at', 'uploaded_by')
    fields = ('title', 'file', 'uploaded_at', 'uploaded_by')
    verbose_name = "پیوست"
    verbose_name_plural = "پیوست‌ها"


@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'assigned_admin',
        'property_type',
        'ownership_status',
        'status',
        'request_survey',
        'attachment_count',
        'created_at',
    )
    list_filter = (
        'property_type',
        'ownership_status',
        'status',
        'request_survey',
        'created_at',
    )
    search_fields = (
        'project__title',
        'assigned_admin__full_name',
        'main_parcel_number',
        'sub_parcel_number',
    )
    autocomplete_fields = ('project', 'assigned_admin')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                'project',
                'assigned_admin',
                'property_type',
                'ownership_status',
                ('area', 'building_area'),
                ('main_parcel_number', 'sub_parcel_number'),
                'request_survey',
                ('location_lat', 'location_lng'),
                'description',
                'status',
                'created_at',
                'updated_at',
            )
        }),
    )

    inlines = [AttachmentInline]

    def attachment_count(self, obj):
        return obj.attachments.count()
    attachment_count.short_description = 'تعداد پیوست‌ها'
