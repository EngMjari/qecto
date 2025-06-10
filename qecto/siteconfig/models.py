# siteconfig/models.py

from django.db import models


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
        return "Site Configuration"

    class Meta:
        verbose_name = "تنظیمات سایت"
        verbose_name_plural = "تنظیمات سایت"
