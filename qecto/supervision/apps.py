from django.apps import AppConfig


class SupervisionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'supervision'
    verbose_name = "درخواست نظارت"
    verbose_name_plural = 'درخواست های نظارت'
