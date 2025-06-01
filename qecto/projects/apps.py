from django.apps import AppConfig


class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'projects'
    def ready(self):
        import projects.signals  # این خط باعث میشه سیگنال‌ها ثبت بشن
