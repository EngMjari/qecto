from django.apps import AppConfig


class RegistrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'registration'
    verbose_name = "درخواست سند"
    verbose_name_plural = 'درخواست های سند'
