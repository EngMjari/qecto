from django.contrib import admin
from .models import SurveyRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1
    readonly_fields = ('uploaded_at', 'uploaded_by')
    fields = ('title', 'file', 'uploaded_at', 'uploaded_by')
    verbose_name = "پیوست"
    verbose_name_plural = "پیوست‌ها"


@admin.register(SurveyRequest)
class SurveyRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'project',
        'assigned_admin',
        'status',
        'area',
        'main_parcel_number',
        'sub_parcel_number',
        'attachment_count',
        'created_at',
    )
    list_filter = ('status', 'property_type', 'created_at')
    search_fields = ('project__title', 'description',
                     'assigned_admin__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('project', 'assigned_admin')
    inlines = [AttachmentInline]

    def attachment_count(self, obj):
        return obj.attachments.count()
    attachment_count.short_description = 'تعداد پیوست‌ها'
