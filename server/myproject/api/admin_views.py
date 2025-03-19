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

@api_view(['GET'])
@permission_classes([AllowAny])
def get_admin_by_email(request, email):
    try:
        admin = get_object_or_404(Admin, email=email)
        serializer = AdminSerializer(admin)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({'message': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def edit_admin(request, admin_id):
    try:
        admin = Admin.objects.get(id=admin_id)
        data = request.data
        serializer = AdminSerializer(admin, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Admin.DoesNotExist:
        return Response({'message': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_admin(request, admin_id):
    try:
        admin = Admin.objects.get(id=admin_id)
        admin.delete()
        return Response({'message': 'Admin deleted successfully'}, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({'message': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)