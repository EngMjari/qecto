# expert/admin.py

from django.contrib import admin
from .models import ExpertEvaluationRequest


@admin.register(ExpertEvaluationRequest)
class ExpertEvaluationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'assigned_admin',
        'property_type',
        'area',
        'status',
        'created_at',
    )
    list_filter = ('property_type', 'status', 'created_at')
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
                ('area', 'building_area'),
                ('main_parcel_number', 'sub_parcel_number'),
                ('location_lat', 'location_lng'),
                'status',
                'description',
                'attachments',
                'created_at',
                'updated_at',
            )
        }),
    )
