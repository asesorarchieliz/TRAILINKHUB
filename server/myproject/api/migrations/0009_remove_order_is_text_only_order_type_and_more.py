# Generated by Django 5.1.2 on 2024-10-29 01:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_order_discount_code'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='is_text_only',
        ),
        migrations.AddField(
            model_name='order',
            name='type',
            field=models.CharField(choices=[('Text Only', 'Text Only'), ('Text with Images', 'Text with Images'), ('Images Only', 'Images Only')], default='Text Only', max_length=20),
        ),
        migrations.AlterField(
            model_name='order',
            name='print_type',
            field=models.CharField(choices=[('Black & White', 'Black & White'), ('Colored', 'Colored')], default='Black & White', max_length=20),
        ),
    ]
