from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import SurveyProject


@receiver(pre_delete, sender=SurveyProject)
def delete_survey_attachments_files(sender, instance, **kwargs):
    for attachment in instance.attachments.all():
        attachment.delete()


@receiver(pre_delete, sender=SurveyProject)
def delete_related_project(sender, instance, **kwargs):
    if instance.project:
        instance.project.delete()
