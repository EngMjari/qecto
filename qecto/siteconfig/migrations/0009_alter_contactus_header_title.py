# Generated by Django 5.2.1 on 2025-06-19 18:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('siteconfig', '0008_alter_contactus_contact_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contactus',
            name='header_title',
            field=models.CharField(default='تماس ما', max_length=50, verbose_name='تیتر تماس با ما'),
        ),
    ]
