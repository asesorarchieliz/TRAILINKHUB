# Generated by Django 4.2.7 on 2025-01-01 10:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0083_order_pickup_date_order_pickup_location'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='document_url',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
