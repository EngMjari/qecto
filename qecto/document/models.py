from django.db import models
from projects.models import Project, User

class DocumentStatus(models.Model):
    title = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class DocumentProject(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="document_project")
    current_status = models.ForeignKey(DocumentStatus, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={"role": "admin"})
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"سند برای {self.project}"


class DocumentAttachment(models.Model):
    project = models.ForeignKey(DocumentProject, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="document_attachments/")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"فایل {self.file.name} برای {self.project}"
