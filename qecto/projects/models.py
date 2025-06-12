# projects/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Project(models.Model):
    title = models.CharField("عنوان", max_length=200)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='projects', verbose_name="مالک")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_projects', verbose_name="سازنده")
    description = models.TextField("توضیحات", blank=True)
    created_at = models.DateTimeField("ساخته شده", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    def __str__(self):
        return self.title

    def all_requests(self):
        """
        متدی برای دسترسی به تمام درخواست‌های پروژه از تمام اپ‌ها.
        این متد لیستی از تمام درخواست‌های مربوط به پروژه در اپ‌های مختلف برمی‌گرداند.
        پشتیبانی از روابط OneToOneField و ForeignKey.
        """
        requests = []

        # درخواست‌های OneToOneField
        if hasattr(self, 'survey_request') and self.survey_request:
            requests.append(self.survey_request)
        if hasattr(self, 'expert_request') and self.expert_request:
            requests.append(self.expert_request)
        if hasattr(self, 'execution_request') and self.execution_request:
            requests.append(self.execution_request)
        if hasattr(self, 'registration_request') and self.registration_request:
            requests.append(self.registration_request)

        # درخواست‌های احتمالی ForeignKey یا ManyToMany
        try:
            requests.extend(self.supervision_requests.all())
        except AttributeError:
            pass

        return requests

    class Meta:
        verbose_name = 'پروژه'
        verbose_name_plural = 'پروژه‌ها'
