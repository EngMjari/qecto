from django.db.models.signals import post_delete
from django.dispatch import receiver
from survey.models import SurveyRequest
from expert.models import ExpertEvaluationProject
from projects.models import Project

# TODO: create signal for this project this is not working


def check_and_delete_project_if_unused(project):
    if not project:
        print("[ProjectSignal] No project provided.")
        return
    has_survey = SurveyRequest.objects.filter(project=project).exists()
    has_expert = ExpertEvaluationProject.objects.filter(
        project=project).exists()
    print(
        f"[ProjectSignal] Checking project {project.id} - {project.title}: has_survey={has_survey}, has_expert={has_expert}")
    if not has_survey and not has_expert:
        print(
            f"[ProjectSignal] Deleting unused project {project.id} - {project.title}")
        project.delete()
    else:
        print(
            f"[ProjectSignal] Project {project.id} still has requests, not deleting.")


@receiver(post_delete, sender=SurveyRequest)
def survey_request_deleted(sender, instance, **kwargs):
    print(f"[ProjectSignal] SurveyProject deleted: {instance.id}")
    check_and_delete_project_if_unused(instance.project)


@receiver(post_delete, sender=ExpertEvaluationProject)
def expert_request_deleted(sender, instance, **kwargs):
    print(f"[ProjectSignal] ExpertEvaluationProject deleted: {instance.id}")
    check_and_delete_project_if_unused(instance.project)
