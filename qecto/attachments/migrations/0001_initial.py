# Generated by Django 5.2.1 on 2025-06-11 11:01

import attachments.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, default='بدون عنوان', max_length=255, verbose_name='عنوان فایل')),
                ('file', models.FileField(upload_to=attachments.models.dynamic_upload_path, verbose_name='فایل')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('object_id', models.UUIDField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='آپلودکننده')),
            ],
        ),
    ]
