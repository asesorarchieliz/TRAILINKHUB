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

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def request_refund(request):
    if request.method == 'POST':
        serializer = RequestRefundSerializer(data=request.data)
        if serializer.is_valid():
            refund_request = serializer.save()
            
            # Send email notification
            send_mail(
                'New Refund Request',
                f"Order ID: {refund_request.order.id}\nGcash Number: {refund_request.gcash_number}\nAmount: {refund_request.amount}",
                'from@example.com',
                ['trailinkhubconcerns@gmail.com'],
                fail_silently=False,
            )
            
            return Response({'message': 'Refund request submitted successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        refunds = RequestRefund.objects.all()
        serializer = RequestRefundSerializer(refunds, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_us(request):
    if request.method == 'POST':
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            # Send email to Trailink team
            send_mail(
                'New Contact Us Message',
                f"Name: {serializer.validated_data['name']}\nEmail: {serializer.validated_data['email']}\nPhone: {serializer.validated_data['phone']}\nMessage: {serializer.validated_data['message']}",
                'from@example.com',
                ['trailinkhubconcerns@gmail.com'],
                fail_silently=False,
            )

            return Response({'message': 'Message sent successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def create_discount_voucher(request):
    if request.method == 'POST':
        serializer = DiscountVoucherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        discount_vouchers = DiscountVoucher.objects.all()
        serializer = DiscountVoucherSerializer(discount_vouchers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def avail_free_printing(request):
    user = request.user

    # Check if the user has availed free printing in the last week
    if user.last_free_printing_availment and timezone.now() - user.last_free_printing_availment < timedelta(weeks=1):
        return Response({'message': 'You can only avail free printing once a week.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    # Update the user's last free printing availment timestamp
    user.last_free_printing_availment = timezone.now()
    user.isFreePrintingAvailed = True
    user.save()

    return Response({'message': 'Free printing availed successfully.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def use_voucher(request):
    discount_code = request.data.get('discount_code')

    try:
        voucher = DiscountVoucher.objects.get(discount_code=discount_code)
    except DiscountVoucher.DoesNotExist:
        return Response({'message': 'Invalid discount code.'}, status=status.HTTP_400_BAD_REQUEST)

    if voucher.is_used:
        return Response({'message': 'This voucher has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

    # Mark the voucher as used
    voucher.is_used = True
    voucher.save()

    return Response({'message': 'Voucher used successfully.'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_discount_voucher(request, voucher_id):
    try:
        voucher = DiscountVoucher.objects.get(id=voucher_id)
    except DiscountVoucher.DoesNotExist:
        return Response({'message': 'Discount voucher not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DiscountVoucherSerializer(voucher, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
