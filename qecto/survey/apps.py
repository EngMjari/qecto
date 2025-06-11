# survey/apps.py
from django.apps import AppConfig


class SurveyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'survey'
    verbose_name = "درخواست نقشه برداری"
    verbose_name_plural = 'درخواست های نقشه برداری'

    def ready(self):
        import survey.signals
