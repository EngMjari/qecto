# siteconfig/utils.py
from .models import SiteConfig


def get_site_config():
    return SiteConfig.objects.first()
