from django.contrib import admin
from .models import SupervisionRequest


@admin.register(SupervisionRequest)
class SupervisionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'project', 'owner', 'supervision_type', 'status',
        'building_area', 'permit_number', 'created_at',
    )
    list_filter = ('status', 'supervision_type', 'created_at')
    search_fields = ('project__title', 'owner__username', 'permit_number')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('project', 'owner', 'assigned_admin')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': (
                'project', 'owner', 'assigned_admin', 'supervision_type', 'status',
                'description', 'permit_number'
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
