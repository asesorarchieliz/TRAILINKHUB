from rest_framework import status
from django.http import JsonResponse
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import ContactMessage, DiscountVoucher, RequestRefund
from .serializer import ContactMessageSerializer, DiscountVoucherSerializer, RequestRefundSerializer
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.permissions import AllowAny, IsAuthenticated  # Import AllowAny
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_voucher(request, discount_code):
    try:
        voucher = DiscountVoucher.objects.get(discount_code=discount_code)
    except DiscountVoucher.DoesNotExist:
        return Response({'message': 'Voucher not found.'}, status=status.HTTP_404_NOT_FOUND)

    voucher.delete()
    return Response({'message': 'Voucher deleted successfully.'}, status=status.HTTP_200_OK)