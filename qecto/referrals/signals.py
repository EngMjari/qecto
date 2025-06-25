from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import AdminUser  # تغییر به AdminUser
from survey.models import SurveyRequest
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=SurveyRequest)
@receiver(post_save, sender=SupervisionRequest)
@receiver(post_save, sender=ExpertEvaluationRequest)
@receiver(post_save, sender=ExecutionRequest)
@receiver(post_save, sender=RegistrationRequest)
def assign_to_superadmin(sender, instance, created, **kwargs):
    if created and not instance.assigned_admin:
        try:
            superadmin = AdminUser.objects.filter(is_superuser=True).first()
            if superadmin:
                instance.assigned_admin = superadmin
                # فقط فیلد assigned_admin آپدیت بشه
                instance.save(update_fields=['assigned_admin'])
                logger.info(
                    f"درخواست {instance} به سوپرادمین {superadmin} تخصیص یافت.")
            else:
                logger.warning(
                    f"هیچ سوپرادمینی برای تخصیص به درخواست {instance} یافت نشد.")
        except Exception as e:
            logger.error(
                f"خطا در تخصیص سوپرادمین به درخواست {instance}: {str(e)}")
