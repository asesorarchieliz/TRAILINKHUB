# Generated by Django 4.2.7 on 2024-12-23 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0079_alter_supply_printer_location'),
    ]

    operations = [
        migrations.AddField(
            model_name='admin',
            name='department',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
