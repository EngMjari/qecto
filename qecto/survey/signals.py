# survey/signals.py
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import SurveyRequest


@receiver(post_delete, sender=SurveyRequest)
def delete_related_attachments(sender, instance, **kwargs):
    for attachment in instance.attachments.all():
        attachment.delete()
