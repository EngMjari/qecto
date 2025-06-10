# siteconfig/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import SiteConfig


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'phone', 'email', 'updated_at',
                    'logo_preview', 'favicon_preview')
    readonly_fields = ('logo_preview', 'favicon_preview', 'updated_at')

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height: 50px;"/>', obj.logo.url)
        return "-"
    logo_preview.short_description = "لوگو"

    def favicon_preview(self, obj):
        if obj.favicon:
            return format_html('<img src="{}" style="height: 30px;"/>', obj.favicon.url)
        return "-"
    favicon_preview.short_description = "فاوآیکن"

    def has_add_permission(self, request):
        # اگر رکوردی از قبل هست، اجازه اضافه کردن رکورد جدید نده
        count = SiteConfig.objects.all().count()
        if count >= 1:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # اجازه حذف ندید (اختیاری، اگر میخواید حذف هم انجام بشه این خط رو حذف کنید)
        return False
