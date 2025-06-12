from django.contrib import admin
from .models import Project
from django.contrib.auth.models import Group, Permission
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_by',
                    'created_at', 'updated_at', 'total_requests')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'owner__full_name', 'created_by__full_name')
    autocomplete_fields = ['owner', 'created_by']
    readonly_fields = ('created_at', 'updated_at', 'request_summary')

    fieldsets = (
        (None, {
            'fields': ('title', 'owner', 'created_by', 'description')
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at')
        }),
        ('درخواست‌ها', {
            'fields': ('request_summary',)
        }),
    )

    def total_requests(self, obj):
        return len(obj.all_requests())
    total_requests.short_description = 'تعداد درخواست‌ها'

    def request_summary(self, obj):
        requests = obj.all_requests()
        if not requests:
            return "درخواستی ثبت نشده است."

        items = []
        for req in requests:
            model = req._meta.model_name
            app_label = req._meta.app_label
            url = reverse(f"admin:{app_label}_{model}_change", args=[req.pk])
            label = f"{str(req)}"
            items.append(
                f"<li><a href='{url}' target='_blank'>{label}</a></li>")

        html = "<ul style='padding-right:20px'>" + "".join(items) + "</ul>"
        return mark_safe(html)

    request_summary.short_description = 'لیست درخواست‌ها'
    request_summary.allow_tags = True
