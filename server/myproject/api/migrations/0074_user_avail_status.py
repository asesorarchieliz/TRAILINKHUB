# Generated by Django 5.1.2 on 2024-12-05 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0073_alter_printer_brand_alter_printer_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avail_status',
            field=models.CharField(default='Not availed', max_length=20),
        ),
    ]
