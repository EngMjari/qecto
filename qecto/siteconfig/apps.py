from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_site_config(sender, **kwargs):
    from siteconfig.models import SiteConfig
    if not SiteConfig.objects.exists():
        SiteConfig.objects.create(site_name="سایت من")


class SiteconfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'siteconfig'

    def ready(self):
        post_migrate.connect(create_site_config, sender=self)
