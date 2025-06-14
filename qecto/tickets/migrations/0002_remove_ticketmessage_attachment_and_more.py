# Generated by Django 5.2.1 on 2025-06-12 19:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attachments', '0002_alter_attachment_options'),
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticketmessage',
            name='attachment',
        ),
        migrations.AddField(
            model_name='ticketmessage',
            name='attachments',
            field=models.ManyToManyField(blank=True, to='attachments.attachment'),
        ),
        migrations.AlterField(
            model_name='ticketsession',
            name='object_id',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
