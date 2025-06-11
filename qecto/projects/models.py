# projects/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Project(models.Model):
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='projects')
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_projects')

    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def all_requests(self):
        """
        متدی برای دسترسی به تمام درخواست‌های پروژه از تمام اپ‌ها.
        این متد لیستی از تمام درخواست‌های مربوط به پروژه در اپ‌های مختلف برمی‌گرداند.
        """
        requests = []
        requests.extend(self.survey_requests.all())
        requests.extend(self.expert_requests.all())
        requests.extend(self.supervision_requests.all())
        requests.extend(self.execution_requests.all())
        requests.extend(self.registration_requests.all())
        return requests
