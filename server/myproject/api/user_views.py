from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils.encoding import force_bytes, force_str
from django.http import JsonResponse
from .models import User, Admin
from .serializer import UserSerializer, AdminSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_avail_status(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        user.avail_status = request.data.get('avail_status', user.avail_status)
        user.save()
        return JsonResponse({'message': f'User status updated to {user.avail_status}.'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    email = request.data.get('email')
    id_number = request.data.get('id_number')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not email or not id_number or not new_password or not confirm_password:
        return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, id_number=id_number)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    user.password = make_password(new_password)  # Hash the new password
    user.save()
    return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_color(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        user = get_object_or_404(User, email=email)
        user.modalColor = data.get('modalColor', user.modalColor)
        user.save()
        return JsonResponse({'message': 'User color updated successfully!'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_secondary_color(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        user = get_object_or_404(User, email=email)
        user.secondaryModalColor = data.get('secondaryModalColor', user.secondaryModalColor)
        user.save()
        return JsonResponse({'message': 'User secondary color updated successfully!'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_font_color(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        user = get_object_or_404(User, email=email)
        user.fontColor = data.get('fontColor', user.fontColor)
        user.save()
        return JsonResponse({'message': 'User font color updated successfully!'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_schedule(request, admin_id):
    try:
        admin = Admin.objects.get(id=admin_id)
        data = json.loads(request.body)
        day = data.get('day')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        is_vacant = data.get('isVacant', False)

        if day and start_time is not None and end_time is not None:
            setattr(admin, f"{day.lower()}_start", start_time)
            setattr(admin, f"{day.lower()}_end", end_time)
            setattr(admin, f"{day.lower()}_is_vacant", is_vacant)
            admin.save()
            return JsonResponse({'message': 'Schedule updated successfully!'}, status=200)
        elif day and is_vacant:
            setattr(admin, f"{day.lower()}_start", None)
            setattr(admin, f"{day.lower()}_end", None)
            setattr(admin, f"{day.lower()}_is_vacant", True)
            admin.save()
            return JsonResponse({'message': 'Schedule updated successfully!'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid data'}, status=400)
    except Admin.DoesNotExist:
        return JsonResponse({'error': 'Admin not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_admins(request):
    try:
        admins = Admin.objects.all()
        serializer = AdminSerializer(admins, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('newPassword')

    if not uidb64 or not token or not new_password:
        return Response({'message': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid token or user ID'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if user.last_login is None:
        user.last_login = timezone.now()
        user.save()
        
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    password_reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"

    context = {
        'password_reset_url': password_reset_url,
        'user': user,
    }
    subject = 'Password Reset Requested'
    email_template_name = 'password_reset_email.html'
    email_content = render_to_string(email_template_name, context)

    send_mail(subject, email_content, 'admin@example.com', [user.email], fail_silently=False)

    return Response({'message': 'Password reset link has been sent to your email'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_free_printing(request):
    now = timezone.now()
    one_week_ago = now - timedelta(weeks=1)
    users = User.objects.filter(isFreePrintingAvailed=True)

    for user in users:
        if user.last_free_printing_availment is None:
            user.last_free_printing_availment = now
            user.save()
            print(f"User: {user.username}, last_free_printing_availment was null, set to today.")
            continue

        days_since_last_availment = (now - user.last_free_printing_availment).days
        print(f"User: {user.username}, Days since last availment: {days_since_last_availment}")

        if user.last_free_printing_availment <= one_week_ago:
            user.isFreePrintingAvailed = False
            user.isFreePrintingUsed = False
            user.save()
            print(f"Reset free printing for user {user.username}")

    return Response({'message': 'Free printing fields reset successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def forget_password(request):
    email = request.data.get('email')
    reason = request.data.get('reason')

    if not email:
        return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not reason:
        return Response({'message': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        try:
            user = Admin.objects.get(email=email)
        except Admin.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if a password reset request has already been sent
    if user.isForgetPassword:
        return Response({'message': 'Password reset request already sent. Please wait before trying again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    # Send email to the user
    send_mail(
        'Password Reset Request',
        f'Please wait for the Trailink Admin to reset your password. If you did not request this, please ignore this email.',
        'from@example.com',
        [email],
        fail_silently=False,
    )

    # Send email to Trailink team
    send_mail(
        'Password Reset Request Notification',
        f'A password reset request has been made for the email: {email}.\nReason: {reason}',
        'from@example.com',
        ['trailinkhub@gmail.com'],
        fail_silently=False,
    )

    # Update the isForgetPassword field
    user.isForgetPassword = True
    user.save()

    return Response({'message': 'Password reset email sent successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def clear_users(request):
    User.objects.all().delete()
    return Response({'message': 'Successfully deleted all users'}, status=200)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_user(request, user_id):
    print(f"Attempting to delete user with ID: {user_id}")  # Debugging statement
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User with ID {user_id} not found")  # Debugging statement
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user.delete()
    print(f"User with ID {user_id} deleted successfully")  # Debugging statement
    return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def block_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user.active = request.data.get('active', not user.active)  # Toggle the active status
    user.save()
    return Response({'message': f'User {"unblocked" if user.active else "blocked"} successfully'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def get_user_by_email(request):
    email = request.query_params.get('email')
    if not email:
        return JsonResponse({'message': 'Email parameter is required'}, status=400)

    try:
        user = User.objects.get(email=email)
        serializer_class = UserSerializer
    except User.DoesNotExist:
        try:
            user = Admin.objects.get(email=email)
            serializer_class = AdminSerializer
        except Admin.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    if request.method == 'GET':
        serializer = serializer_class(user)
        return JsonResponse(serializer.data, status=200)
    
    if request.method == 'PUT':
        data = request.data
        serializer = serializer_class(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=200)
        return JsonResponse(serializer.errors, status=400)
    
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
def get_user_by_id(request, user_id):
    print(f"Received request for user ID: {user_id} with method: {request.method}")  # Debugging statement
    try:
        user = User.objects.get(id=user_id)
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method in ['PUT', 'PATCH']:
            data = request.data
            serializer = UserSerializer(user, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_name(request, name):
    try:
        user = User.objects.get(name=name)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['PUT'])
@permission_classes([AllowAny])
def refund_user_points(request, user_id):
    logger.info(f"Received request to refund points for user ID: {user_id}")
    logger.info(f"Request data: {request.data}")
    try:
        user = User.objects.get(pk=user_id)
        logger.info(f"Found user: {user.email}")
        new_points = request.data.get('trailpay_points')
        if new_points is None:
            logger.error("trailpay_points is required")
            return JsonResponse({'error': 'trailpay_points is required'}, status=400)

        try:
            new_points = int(new_points)
        except ValueError:
            logger.error("trailpay_points must be an integer")
            return JsonResponse({'error': 'trailpay_points must be an integer'}, status=400)

        logger.info(f"Setting TrailPay points to: {new_points}")
        user.trailpay_points = new_points
        user.save()
        logger.info(f"Updated TrailPay points: {user.trailpay_points}")
        return JsonResponse({'message': 'TrailPay points updated successfully!'}, status=200)
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found")
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating TrailPay points: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_admin_by_name(request, name):
    try:
        admin = Admin.objects.get(name=name)
        serializer = AdminSerializer(admin)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({'message': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)