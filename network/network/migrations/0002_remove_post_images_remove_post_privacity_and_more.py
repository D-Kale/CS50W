# Generated by Django 5.1.1 on 2024-10-12 13:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='images',
        ),
        migrations.RemoveField(
            model_name='post',
            name='privacity',
        ),
        migrations.DeleteModel(
            name='PostImages',
        ),
    ]
