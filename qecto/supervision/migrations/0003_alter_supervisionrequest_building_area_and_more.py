# Generated by Django 5.2.1 on 2025-06-12 16:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0004_alter_project_options'),
        ('supervision', '0002_alter_supervisionrequest_project'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supervisionrequest',
            name='building_area',
            field=models.FloatField(verbose_name='مساحت بنا (متر مربع)'),
        ),
        migrations.AlterField(
            model_name='supervisionrequest',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='supervision_requests', to='projects.project'),
        ),
    ]
