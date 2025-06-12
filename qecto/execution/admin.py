# execution/admin.py

from django.contrib import admin
from .models import ExecutionRequest


@admin.register(ExecutionRequest)
class ExecutionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'assigned_admin',
        'status',
        'building_area',
        'created_at',
        'updated_at',
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('project__title',
                     'assigned_admin__full_name', 'permit_number')
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
                'attachments',
                'created_at',
                'updated_at',
            )
        }),
    )
