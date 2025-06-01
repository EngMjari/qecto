from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver
from .models import ExpertEvaluationProject
from projects.signals import check_and_delete_project_if_unused  # فراخوانی تابع پروژه


@receiver(pre_delete, sender=ExpertEvaluationProject)
def delete_expert_attachments_files(sender, instance, **kwargs):
    print(
        f"[ExpertSignal] Deleting attachments for ExpertEvaluationProject {instance.id}")
    for attachment in instance.attachments.all():
        print(
            f"[ExpertSignal] Deleting attachment {attachment.id} - {attachment.title}")
        attachment.delete()


@receiver(pre_save, sender=ExpertEvaluationProject)
def store_old_project(sender, instance, **kwargs):
    if not instance.pk:
        print("[ExpertSignal] New ExpertEvaluationProject, no old project to store.")
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
        instance._old_project = old_instance.project
        print(
            f"[ExpertSignal] Stored old project id: {instance._old_project.id} for ExpertEvaluationProject {instance.id}")
    except sender.DoesNotExist:
        instance._old_project = None
        print("[ExpertSignal] Old ExpertEvaluationProject instance does not exist.")


@receiver(post_save, sender=ExpertEvaluationProject)
def check_old_project_on_update(sender, instance, created, **kwargs):
    if created:
        print(f"[ExpertSignal] ExpertEvaluationProject created: {instance.id}")
        return
    old_project = getattr(instance, '_old_project', None)
    new_project = instance.project
    print(
        f"[ExpertSignal] ExpertEvaluationProject updated: {instance.id}, old_project={getattr(old_project, 'id', None)}, new_project={new_project.id if new_project else None}")
    if old_project and old_project != new_project:
        print(
            f"[ExpertSignal] Checking old project {old_project.id} for deletion after update.")
        check_and_delete_project_if_unused(old_project)
