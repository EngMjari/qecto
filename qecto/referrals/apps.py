from django.apps import AppConfig


class ReferralsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'referrals'
    verbose_name = 'سیستم ارجاع'

    def ready(self):
        import referrals.signals
