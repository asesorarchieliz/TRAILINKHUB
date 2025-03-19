from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Message
from .serializer import MessageSerializer
from rest_framework.permissions import AllowAny
from django.db.models import Q, Case, When, Value, F, Count

@api_view(['GET'])
@permission_classes([AllowAny])
def get_messages(request):
    sender_name = request.query_params.get('senderName')
    receiver_name = request.query_params.get('receiverName')
    printer_name = request.query_params.get('printerName')
    
    if sender_name and receiver_name:
        messages = Message.objects.filter(
            (Q(sender=sender_name) & Q(receiver=receiver_name)) |
            (Q(sender=receiver_name) & Q(receiver=sender_name))
        ).order_by('timestamp')
    elif printer_name:
        messages = Message.objects.filter(receiver=printer_name).order_by('timestamp')
    else:
        messages = Message.objects.all().order_by('timestamp')
    
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request):
    data = request.data
    sender_name = data.get('senderName')
    receiver_names = data.get('receiverNames')  # List of receiver names
    message_text = data.get('message')
    printer_location = data.get('printer_location')  # Add this line to get the printer location
    qr_codes = data.get('qr_codes', [None] * len(receiver_names))  # List of QR codes (discount codes), default to None

    if not sender_name or not receiver_names or not message_text:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    created_messages = []
    for receiver_name, qr_code in zip(receiver_names, qr_codes):
        message = Message.objects.create(
            sender=sender_name,
            receiver=receiver_name,
            message=message_text,
            printer_location=printer_location,  # Add this line to set the printer location
            qr_code=qr_code,  # Use discount code as QR code, can be None
            seen=False  # Set seen to False for new messages
        )
        created_messages.append(message)

    serializer = MessageSerializer(created_messages, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_message(request, message_id):
    message = get_object_or_404(Message, id=message_id)
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_users_for_printer(request, printer_name):
    messages = Message.objects.filter(receiver=printer_name).values('sender').distinct()
    users = [message['sender'] for message in messages]
    return Response(users, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_message_names(request):
    data = request.data
    old_name = data.get('oldName')
    new_name = data.get('newName')

    if not old_name or not new_name:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    messages_updated = Message.objects.filter(Q(sender=old_name) | Q(receiver=old_name)).update(
        sender=Case(
            When(sender=old_name, then=Value(new_name)),
            default=F('sender')
        ),
        receiver=Case(
            When(receiver=old_name, then=Value(new_name)),
            default=F('receiver')
        )
    )

    return Response({'messages_updated': messages_updated}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def mark_messages_as_seen(request):
    data = request.data
    sender_name = data.get('senderName')
    printer_location = data.get('printerLocation')

    if not sender_name or not printer_location:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    messages = Message.objects.filter(
        Q(printer_location=printer_location) & Q(sender=sender_name)
    )

    updated_count = messages.update(seen=True)
    return Response({'status': 'Messages marked as seen', 'updated_count': updated_count}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_unseen_messages_count(request):
    unseen_counts = Message.objects.filter(seen=False).values('receiver', 'sender').annotate(count=Count('id'))
    unseen_counts_dict = {}
    for item in unseen_counts:
        receiver = item['receiver']
        sender = item['sender']
        count = item['count']
        if receiver not in unseen_counts_dict:
            unseen_counts_dict[receiver] = []
        unseen_counts_dict[receiver].append({'sender': sender, 'count': count})
    return Response(unseen_counts_dict, status=status.HTTP_200_OK)