# Generated by Django 5.1.2 on 2024-11-27 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0063_order_refund_method'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='refund_method',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
