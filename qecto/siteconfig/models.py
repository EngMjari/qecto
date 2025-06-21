# siteconfig/models.py

from django.db import models
from core.models import AdminUser


class SiteConfig(models.Model):
    site_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='site/logo/', blank=True, null=True)
    favicon = models.ImageField(
        upload_to='site/favicon/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default="#ff5700")
    secondary_color = models.CharField(max_length=7, default="#002a3a")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "تنظیمات سایت"

    class Meta:
        verbose_name = "تنظیمات سایت"
        verbose_name_plural = "تنظیمات سایت"


class Services(models.Model):
    title = models.CharField(max_length=50, null=True,
                             blank=True, name="title", verbose_name="موضوع")
    description = models.TextField(
        max_length=150, null=True, blank=True, verbose_name="توضیحات")
    icon = models.CharField(max_length=50, null=True,
                            blank=True, verbose_name="آیکون")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'سرویس'
        verbose_name_plural = 'سرویس ها'


class HomePage(models.Model):
    header_title = models.CharField(
        blank=True, verbose_name="تایتل سایت", default="ککتوسازه هیرکاسب")
    header_description = models.TextField(
        blank=True, verbose_name="توضیحات هیدر")
    header_image = models.ImageField(
        null=True, blank=True, upload_to="site/homePage", verbose_name="عکس هیدر")
    our_projects_title = models.CharField(
        max_length=100, blank=True, verbose_name="تایتل دستاورد های ما", default="دستاوردهای ما")
    our_projects_description = models.TextField(
        null=True, blank=True, verbose_name="توضیحات دستاوردهای ما")
    complete_requests = models.IntegerField(
        null=True, blank=True, verbose_name="پروژه های تکمیل شده")
    user = models.IntegerField(
        null=True, blank=True, verbose_name="کاربران فعال")
    tickets = models.IntegerField(
        null=True, blank=True, verbose_name="تعداد تیکت ها")
    services_title = models.CharField(
        max_length=100, blank=True, default="خدمات ما", verbose_name="تایتل خدمات ما")
    services = models.ManyToManyField(Services, verbose_name="سرویس ها")
    services_description = models.TextField(
        max_length=200, null=True, blank=True, verbose_name="توضیحات خدمات ما")
    request_title = models.TextField(
        max_length=100, blank=True, verbose_name="تیتر ثبت درخواست")
    request_description = models.TextField(
        max_length=200, blank=True, null=True, verbose_name="توضیحات ثبت درخواست")
    request_bgColor = models.CharField(
        max_length=10, blank=True, null=True, verbose_name="رنگ پس زمینه درخواست")
    request_bgImage = models.ImageField(
        upload_to="site/homePage", blank=True, null=True, verbose_name=" پس زمینه درخواست")

    def __str__(self):
        return "تنظیمات صفحه اصلی"

    class Meta:
        verbose_name = 'صفحه اصلی'
        verbose_name_plural = 'صفحه اصلی'


class AboutUs(models.Model):
    header_title = models.CharField(
        max_length=50, default="درباره ما", verbose_name="تیتر درباره ما")
    header_description = models.TextField(
        max_length=100, blank=True, verbose_name="توضیحات درباره ما")
    header_image = models.ImageField(
        upload_to="site/AboutUs", blank=True, null=True, verbose_name="عکس درباره ما")
    our_story = models.TextField(blank=True, verbose_name="داستان ما")
    our_story_image = models.ImageField(
        upload_to="site/AboutUs", blank=True, null=True, verbose_name="عکس داستان ما")
    our_team_title = models.CharField(
        max_length=50, blank=True, verbose_name="تیتر تیم ما")
    our_team_description = models.TextField(
        max_length=100, blank=True, verbose_name="توضیحات تیم ما")
    our_team_member = models.ManyToManyField(
        AdminUser, verbose_name="اعضای تیم ما")

    def __str__(self):
        return 'درباره ما'

    class Meta:
        verbose_name = 'درباره ما'
        verbose_name_plural = 'درباره ما'


class ContactUs(models.Model):
    header_title = models.CharField(
        max_length=50, default="تماس ما", verbose_name="تیتر تماس با ما")
    header_description = models.TextField(
        max_length=100, blank=True, verbose_name="توضیحات درباره ما")
    header_image = models.ImageField(
        upload_to="site/ContactUs", blank=True, null=True, verbose_name="عکس تماس با ما")
    ai_title = models.CharField(
        max_length=50, blank=True, verbose_name="تیتر هوش مصنوعی")
    ai_descriptions = models.TextField(
        max_length=200, blank=True, verbose_name="توضیحات هوش مصنوعی")
    ai_placeholder = models.TextField(
        max_length=100, blank=True, verbose_name="متن جایگزین پیشفرض")
    ai_text = models.TextField(blank=True, verbose_name="درستور هوش مصنوعی")
    ai_request_text = models.TextField(
        blank=True, verbose_name="دستور هوش مصنوعی برای درخواست")
    contact_time = models.CharField(
        max_length=100, blank=True, verbose_name="ساعت کاری")

    def __str__(self):
        return "تماس با ما"

    class Meta:
        verbose_name = 'تماس با ما'
        verbose_name_plural = 'تماس با ما'
