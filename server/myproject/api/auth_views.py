from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import User, Admin
from .serializer import UserSerializer, AdminSerializer, AdminChangePasswordSerializer
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_change_password(request):
    serializer = AdminChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        # Get the Admin instance
        admin = Admin.objects.get(email=serializer.validated_data['email'])
        
        # Update the password using the serializer
        serializer.update(admin, serializer.validated_data)
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    if request.method == 'POST':
        data = request.data.copy()  # Make a mutable copy of the request data
        if 'password' in data:
            data['password'] = make_password(data['password'])  # Hash the password
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_signup(request):
    if request.method == 'POST':
        data = request.data.copy()  # Make a mutable copy of the request data
        if 'password' in data:
            data['password'] = make_password(data['password'])  # Hash the password
        serializer = AdminSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    print(f"Login attempt with username: {username}")  # Log the username

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Manually check the password
    is_correct = check_password(password, user.password)

    if is_correct:
        return Response({'message': 'Login successful', 'email': user.email, 'id_number': user.id_number, 'name': user.name}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username').strip()
    password = request.data.get('password').strip()

    try:
        admin = Admin.objects.get(username=username)
    except Admin.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Manually check the password
    is_correct = check_password(password, admin.password)

    if is_correct:
        return Response({'message': 'Login successful', 'email': admin.email}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    username = request.GET.get('username', None)
    if username:
        exists = User.objects.filter(username=username).exists()
        return Response({'exists': exists})
    return Response({'error': 'Username not provided'}, status=status.HTTP_400_BAD_REQUEST)