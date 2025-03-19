from rest_framework import serializers
from .models import User, Admin, Order, Supply, ContactMessage, DiscountVoucher, RequestRefund, Printer, Logs, Transaction, Message
from django.contrib.auth.hashers import make_password, check_password
from django.core.files.base import ContentFile
import base64
import uuid

class AdminChangePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Retrieve the admin based on email
        try:
            admin = Admin.objects.get(email=data['email'])
        except Admin.DoesNotExist:
            raise serializers.ValidationError({'email': 'Admin with this email does not exist'})

        # Manually check the old password
        if not check_password(data['old_password'], admin.password):
            raise serializers.ValidationError({'old_password': 'Old password is not correct'})

        # If old password is correct, allow the new password to pass validation
        return data

    def update(self, instance, validated_data):
        # Update the password with the new password
        instance.password = make_password(validated_data['new_password'])
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

    def validate_document_url(self, value):
        # Ensure the document_url is correctly formatted
        if value and value.startswith('/media/'):
            value = value.replace('/media/', '')
        return value

class SupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class DiscountVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountVoucher
        fields = '__all__'
        
class RequestRefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestRefund
        fields = '__all__'

class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = '__all__'
        
class LogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logs
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'