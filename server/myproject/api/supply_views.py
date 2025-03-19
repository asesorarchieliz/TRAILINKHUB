from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Supply
from .serializer import SupplySerializer
from rest_framework.permissions import AllowAny
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_supply_field(request, pk, field_name):
    logger.info(f"Received request to update field {field_name} for supply with id {pk}")
    try:
        supply = Supply.objects.get(pk=pk)
    except Supply.DoesNotExist:
        logger.error(f"Supply with id {pk} does not exist.")
        return Response(status=status.HTTP_404_NOT_FOUND)

    if field_name not in request.data:
        logger.error(f"Field name {field_name} not in request data.")
        return Response({"error": "Field name not in request data"}, status=status.HTTP_400_BAD_REQUEST)

    if not hasattr(Supply, field_name):
        logger.error(f"Field name {field_name} is not a valid field of Supply.")
        return Response({"error": "Invalid field name"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            old_value = getattr(supply, field_name)
            new_value = request.data[field_name]
            if new_value is None:
                logger.error(f"New value for field {field_name} is None.")
                return Response({"error": "New value cannot be None"}, status=status.HTTP_400_BAD_REQUEST)
            setattr(supply, field_name, new_value)
            supply.save()
            logger.info(f"Supply with id {pk} updated field {field_name} from {old_value} to {new_value}.")
            return Response(SupplySerializer(supply).data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating supply: {e}")
        return Response({"error": "Error updating supply"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_multiple_supply_fields(request, pk):
    logger.info(f"Received request to update multiple fields for supply with id {pk}")
    try:
        supply = Supply.objects.get(pk=pk)
    except Supply.DoesNotExist:
        logger.error(f"Supply with id {pk} does not exist.")
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = SupplySerializer(supply, data=request.data, partial=True)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                old_values = {field: getattr(supply, field) for field in request.data.keys()}
                serializer.save()
                new_values = {field: getattr(supply, field) for field in request.data.keys()}
                logger.info(f"Supply with id {pk} updated fields from {old_values} to {new_values}.")
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating supply: {e}")
            return Response({"error": "Error updating supply"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    logger.error(f"Invalid data for supply update: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([AllowAny])
def get_or_create_supply_by_printer_location(request, printer_location):
    logger.info(f"Received request to get or create supply for printer with location {printer_location}")
    try:
        supply = Supply.objects.get(printer_location=printer_location)
        if request.method == 'PATCH':
            serializer = SupplySerializer(supply, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Supply for printer with location {printer_location} updated.")
                return Response(serializer.data, status=status.HTTP_200_OK)
            logger.error(f"Invalid data for supply update: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(SupplySerializer(supply).data, status=status.HTTP_200_OK)
    except Supply.DoesNotExist:
        if request.method == 'POST':
            new_supply = Supply(printer_location=printer_location)
            new_supply.save()
            logger.info(f"Created new supply for printer with location {printer_location}")
            return Response(SupplySerializer(new_supply).data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Supply for printer with location {printer_location} does not exist.")
            return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_supplies(request):
    logger.info("Received request to get all supplies")
    supplies = Supply.objects.all()
    return Response(SupplySerializer(supplies, many=True).data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_supply_field_by_location(request, printer_location, field_name):
    logger.info(f"Received request to update field {field_name} for supply with printer location {printer_location}")
    try:
        supply = Supply.objects.get(printer_location=printer_location)
    except Supply.DoesNotExist:
        logger.error(f"Supply with printer location {printer_location} does not exist.")
        return Response(status=status.HTTP_404_NOT_FOUND)

    if field_name not in request.data:
        logger.error(f"Field name {field_name} not in request data.")
        return Response({"error": "Field name not in request data"}, status=status.HTTP_400_BAD_REQUEST)

    if not hasattr(Supply, field_name):
        logger.error(f"Field name {field_name} is not a valid field of Supply.")
        return Response({"error": "Invalid field name"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            old_value = getattr(supply, field_name)
            new_value = request.data[field_name]
            if new_value is None:
                logger.error(f"New value for field {field_name} is None.")
                return Response({"error": "New value cannot be None"}, status=status.HTTP_400_BAD_REQUEST)
            setattr(supply, field_name, new_value)
            supply.save()
            logger.info(f"Supply with printer location {printer_location} updated field {field_name} from {old_value} to {new_value}.")
            return Response(SupplySerializer(supply).data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating supply: {e}")
        return Response({"error": "Error updating supply"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)