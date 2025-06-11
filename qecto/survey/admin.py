# survey/admin.py
from django.contrib import admin
from .models import SurveyRequest


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
        'created_at',
    )
    list_filter = ('status', 'property_type', 'created_at')
    search_fields = ('project__title', 'description',
                     'assigned_admin__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
