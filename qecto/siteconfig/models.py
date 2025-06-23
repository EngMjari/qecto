# siteconfig/models.py

from django.db import models
from core.models import AdminUser
from django.core.files.base import ContentFile
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from PIL import Image
import io
import os


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

    def save(self, *args, **kwargs):
        # ذخیره اولیه برای دسترسی به instance قبلی
        old_instance = HomePage.objects.get(pk=self.pk) if self.pk else None

        super().save(*args, **kwargs)

        # پردازش header_image
        if self.header_image and hasattr(self.header_image, 'file'):
            img = Image.open(self.header_image.file)
            original_width, original_height = img.size
            target_ratio = 16 / 9
            current_ratio = original_width / original_height

            if current_ratio != target_ratio:
                if current_ratio > target_ratio:
                    new_height = int(original_width / target_ratio)
                    img = img.resize((original_width, new_height),
                                     Image.Resampling.LANCZOS)
                else:
                    new_width = int(original_height * target_ratio)
                    img = img.resize((new_width, original_height),
                                     Image.Resampling.LANCZOS)

            if img.mode == 'RGBA':
                img = img.convert('RGB')

            img_io = io.BytesIO()
            original_format = img.format if img.format else 'JPEG'
            img.save(img_io, format=original_format, quality=95)
            self.header_image.save(
                f"header_{self.id}.{original_format.lower()}",
                ContentFile(img_io.getvalue()),
                save=False
            )

        # پردازش request_bgImage
        if self.request_bgImage and hasattr(self.request_bgImage, 'file'):
            img = Image.open(self.request_bgImage.file)
            original_width, original_height = img.size
            target_ratio = 16 / 9
            current_ratio = original_width / original_height

            if current_ratio != target_ratio:
                if current_ratio > target_ratio:
                    new_height = int(original_width / target_ratio)
                    img = img.resize((original_width, new_height),
                                     Image.Resampling.LANCZOS)
                else:
                    new_width = int(original_height * target_ratio)
                    img = img.resize((new_width, original_height),
                                     Image.Resampling.LANCZOS)

            if img.mode == 'RGBA':
                img = img.convert('RGB')

            img_io = io.BytesIO()
            original_format = img.format if img.format else 'JPEG'
            img.save(img_io, format=original_format, quality=95)
            self.request_bgImage.save(
                f"request_{self.id}.{original_format.lower()}",
                ContentFile(img_io.getvalue()),
                save=False
            )

        super().save(update_fields=['header_image', 'request_bgImage'])

    def __str__(self):
        return "تنظیمات صفحه اصلی"

    class Meta:
        verbose_name = 'صفحه اصلی'
        verbose_name_plural = 'صفحه اصلی'


@receiver(post_delete, sender=HomePage)
def delete_old_file(sender, instance, **kwargs):
    # حذف فایل header_image هنگام حذف شیء
    if instance.header_image:
        if os.path.isfile(instance.header_image.path):
            os.remove(instance.header_image.path)

    # حذف فایل request_bgImage هنگام حذف شیء
    if instance.request_bgImage:
        if os.path.isfile(instance.request_bgImage.path):
            os.remove(instance.request_bgImage.path)


@receiver(pre_save, sender=HomePage)
def delete_old_file_on_update(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = HomePage.objects.get(pk=instance.pk)
            # حذف فایل header_image قدیمی اگر تغییر کرده یا خالی شده
            if old_instance.header_image and (not instance.header_image or old_instance.header_image != instance.header_image):
                if os.path.isfile(old_instance.header_image.path):
                    os.remove(old_instance.header_image.path)
            # حذف فایل request_bgImage قدیمی اگر تغییر کرده یا خالی شده
            if old_instance.request_bgImage and (not instance.request_bgImage or old_instance.request_bgImage != instance.request_bgImage):
                if os.path.isfile(old_instance.request_bgImage.path):
                    os.remove(old_instance.request_bgImage.path)
        except HomePage.DoesNotExist:
            pass


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
