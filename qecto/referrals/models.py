from django.db import models
from core.models import AdminUser
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError
import uuid


class Referral(models.Model):
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={
            'model__in': [
                'surveyrequest',
                'supervisionrequest',
                'expertevaluationrequest',
                'executionrequest',
                'registrationrequest',
            ]
        },
    )
    object_id = models.UUIDField()
    request = GenericForeignKey('content_type', 'object_id')
    referrer_admin = models.ForeignKey(
        AdminUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_referrals',
    )
    assigned_admin = models.ForeignKey(
        AdminUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_referrals',
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # اعتبارسنجی object_id
        try:
            uuid.UUID(str(self.object_id))
        except ValueError:
            raise ValidationError("object_id باید یک UUID معتبر باشد.")
        # چک وجود درخواست
        try:
            model_class = self.content_type.model_class()
            model_class.objects.get(id=self.object_id)
        except model_class.DoesNotExist:
            raise ValidationError(
                f"درخواست با ID {self.object_id} برای {self.content_type.model} یافت نشد.")

    def __str__(self):
        return f"Referral for {self.content_type.model} {self.object_id} to {self.assigned_admin}"

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]
