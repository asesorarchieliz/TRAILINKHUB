# Generated by Django 5.1.2 on 2024-11-18 10:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0040_printer_used_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='printer',
            name='total_sales',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
