from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Printer
from .serializer import PrinterSerializer
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_printer_usage(request, pk):
    printer = get_object_or_404(Printer, pk=pk)
    data = request.data

    used_count = data.get('used_count')
    total_sales = data.get('total_sales')

    if used_count is not None:
        printer.used_count = used_count

    if total_sales is not None:
        printer.total_sales = total_sales

    printer.save()
    serializer = PrinterSerializer(printer)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_location(request, location):
    printers = Printer.objects.filter(location=location)
    if not printers.exists():
        return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
    
    printers.delete()
    return Response({'message': 'Location and associated printers deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_location(request):
    location = request.data.get('location')
    if not location:
        return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a new Printer instance with the provided location
    printer = Printer(location=location)
    printer.save()

    return Response({'message': 'Location added successfully'}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def printer_list(request):
    if request.method == 'GET':
        printers = Printer.objects.all()
        serializer = PrinterSerializer(printers, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PrinterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def printer_detail(request, pk):
    printer = get_object_or_404(Printer, pk=pk)

    if request.method == 'GET':
        serializer = PrinterSerializer(printer)
        return Response(serializer.data)

    elif request.method == 'PUT' or request.method == 'PATCH':
        serializer = PrinterSerializer(printer, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        printer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)