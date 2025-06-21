from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_site_config(sender, **kwargs):
    from siteconfig.models import SiteConfig, HomePage, AboutUs, ContactUs
    if not SiteConfig.objects.exists():
        SiteConfig.objects.create(site_name="سایت من")
    if not HomePage.objects.exists():
        HomePage.objects.create()
    if not AboutUs.objects.exists():
        AboutUs.objects.create()
    if not ContactUs.objects.exists():
        ContactUs.objects.create()


class SiteconfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'siteconfig'
    verbose_name = "تنظیمات سایت"

    def ready(self):
        post_migrate.connect(create_site_config, sender=self)
