# siteconfig/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import SiteConfig, HomePage, AboutUs, ContactUs, Services


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


@admin.register(HomePage)
class HomePageAdmin(admin.ModelAdmin):
    list_display = ('header_image', 'header_image', 'our_projects_description', 'complete_requests',
                    'user', 'tickets')

    def has_add_permission(self, request):
        # اگر رکوردی از قبل هست، اجازه اضافه کردن رکورد جدید نده
        count = HomePage.objects.all().count()
        if count >= 1:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # اجازه حذف ندید (اختیاری، اگر میخواید حذف هم انجام بشه این خط رو حذف کنید)
        return False


@admin.register(AboutUs)
class AboutUsAdmin(admin.ModelAdmin):
    list_display = ('header_title', 'header_description', 'header_image', 'our_story',
                    'our_story_image', 'our_team_title', 'our_team_description')

    def has_add_permission(self, request):
        # اگر رکوردی از قبل هست، اجازه اضافه کردن رکورد جدید نده
        count = AboutUs.objects.all().count()
        if count >= 1:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # اجازه حذف ندید (اختیاری، اگر میخواید حذف هم انجام بشه این خط رو حذف کنید)
        return False


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('header_title', 'header_description', 'header_image', 'ai_title',
                    'ai_descriptions', 'ai_placeholder')

    def has_add_permission(self, request):
        # اگر رکوردی از قبل هست، اجازه اضافه کردن رکورد جدید نده
        count = ContactUs.objects.all().count()
        if count >= 1:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # اجازه حذف ندید (اختیاری، اگر میخواید حذف هم انجام بشه این خط رو حذف کنید)
        return False


@admin.register(Services)
class ServicesAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'icon')
