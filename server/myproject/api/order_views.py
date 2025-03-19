from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Order, Supply
from .serializer import OrderSerializer, SupplySerializer
from rest_framework.permissions import AllowAny
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_order_total_price(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_total_price = request.data.get('total_price')
    if new_total_price is not None:
        order.total_price = new_total_price

    remark = request.data.get('remark', '')
    order.remark = remark

    order.save()
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def delete_multiple_orders(request):
    order_ids = request.data.get('order_ids', [])

    if not order_ids:
        return Response({'message': 'Order IDs are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            orders = Order.objects.filter(id__in=order_ids)
            orders.delete()

        return Response({'message': 'Orders deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error deleting orders: {e}")
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def change_multiple_order_statuses(request):
    order_ids = request.data.get('order_ids', [])
    new_status = request.data.get('status', '')
    refund_method = request.data.get('refund_method', '')
    remark = request.data.get('remark', '')

    logger.info(f"Received request to change statuses for orders: {order_ids} to {new_status}")

    if not order_ids or not new_status:
        logger.error("Order IDs and new status are required")
        return Response({"error": "Order IDs and new status are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            orders = Order.objects.filter(id__in=order_ids)
            logger.info(f"Found orders: {orders}")

            for order in orders:
                logger.info(f"Updating order {order.id} status from {order.status} to {new_status}")
                order.status = new_status
                if refund_method:
                    logger.info(f"Updating order {order.id} refund method to {refund_method}")
                    order.refund_method = refund_method
                if remark:
                    logger.info(f"Updating order {order.id} remark to {remark}")
                    order.remark = remark
                order.save()
                logger.info(f"Order {order.id} updated successfully")

        logger.info("Order statuses updated successfully")
        return Response({"status": "success", "message": "Order statuses updated successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating order statuses: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def update_queue_numbers(request):
    try:
        # Remove queue numbers for orders that are cancelled, refunded, or completed
        Order.objects.filter(status__in=['Refunded', 'Cancelled', 'Completed']).update(queue_no=None)

        # Filter orders that need a queue number and are not in the final statuses
        orders = Order.objects.filter(queue_no__isnull=True).exclude(status__in=['Refunded', 'Cancelled', 'Completed']).order_by('date_time')
        last_order = Order.objects.exclude(queue_no__isnull=True).order_by('-queue_no').first()
        last_queue_no = last_order.queue_no if last_order else 0

        print(f"Starting queue number: {last_queue_no}")

        for order in orders:
            last_queue_no += 1
            order.queue_no = last_queue_no
            order.save()
            print(f"Assigned queue number {last_queue_no} to order ID {order.id}")

        logger.info("Queue numbers updated successfully")
        return Response({'status': 'success', 'message': 'Queue numbers updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating queue numbers: {e}")
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def change_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if not new_status:
        return Response({'message': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    order.save()

    if new_status == 'Ongoing':
        update_supplies(order)

    return Response({'message': 'Order status updated successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    logger.info(f"Request data: {request.data}")
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            order = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        logger.error(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def update_supplies(order):
    supply = Supply.objects.first()  # Assuming there's only one supply record
    if not supply:
        return

    pages = order.pages * order.copies

    if order.document_type == 'A4':
        supply.a4_supplies = max(0, supply.a4_supplies - pages)
    elif order.document_type == 'Letter':
        supply.letter_supplies = max(0, supply.letter_supplies - pages)
    elif order.document_type == 'Legal':
        supply.legal_supplies = max(0, supply.legal_supplies - pages)

    if order.print_type == 'Colored':
        supply.blue_ink = max(0, supply.blue_ink - pages)
        supply.yellow_ink = max(0, supply.yellow_ink - pages)
        supply.red_ink = max(0, supply.red_ink - pages)
        supply.black_ink = max(0, supply.black_ink - pages)
    else:
        supply.black_ink = max(0, supply.black_ink - pages)

    supply.save()

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_supply(request):
    order_id = request.data.get('order_id')
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    supply = Supply.objects.first()  # Assuming there's only one supply record
    if not supply:
        return Response({'message': 'Supply not found'}, status=status.HTTP_404_NOT_FOUND)

    pages = order.pages * order.copies

    if order.document_type == 'A4':
        supply.a4_supplies = max(0, supply.a4_supplies - pages)
    elif order.document_type == 'Letter':
        supply.letter_supplies = max(0, supply.letter_supplies - pages)
    elif order.document_type == 'Legal':
        supply.legal_supplies = max(0, supply.legal_supplies - pages)

    if order.print_type == 'Colored':
        supply.blue_ink = max(0, supply.blue_ink - pages)
        supply.yellow_ink = max(0, supply.yellow_ink - pages)
        supply.red_ink = max(0, supply.red_ink - pages)
        supply.black_ink = max(0, supply.black_ink - pages)
    else:
        supply.black_ink = max(0, supply.black_ink - pages)

    supply.save()
    return Response({'message': 'Supplies updated successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_orders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_order(request, order_id):
    logger.info(f"Received request to update order with ID: {order_id}")
    try:
        order = Order.objects.get(id=order_id)
        logger.info(f"Order found: {order}")
    except Order.DoesNotExist:
        logger.error(f"Order with ID {order_id} not found")
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        if 'payment_image' in request.FILES:
            # Delete the current image if it exists
            if order.payment_image:
                order.payment_image.delete()

            # Update the order with the new image
            order.payment_image = request.FILES['payment_image']

        if 'document_url' in request.FILES:
            # Delete the current document if it exists
            if order.document_url:
                order.document_url.delete()

            # Update the order with the new document
            order.document_url = request.FILES['document_url']

        # Update the remark
        remark = request.data.get('remark', order.remark)
        order.remark = remark

        # Update the queue number
        queue_no = request.data.get('queue_no', order.queue_no)
        order.queue_no = queue_no

        # Update the printer location
        printer_location = request.data.get('printer_location', order.printer_location)
        order.printer_location = printer_location

        # Update the status
        new_status = request.data.get('status', order.status)
        order.status = new_status

        order.save()
        logger.info(f"Order with ID {order_id} updated successfully")
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating order with ID {order_id}: {e}")
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    order.delete()
    return Response({'message': 'Order deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PUT':
        order.status = 'Pending Refund'
        order.refund_method = request.data.get('refund_method', '')
        remark = request.data.get('remark', None)
        order.remark = remark if remark is not None else None
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_supply(request):
    try:
        supply = Supply.objects.first()  # Assuming there's only one supply record
        if not supply:
            supply = Supply.objects.create()  # Create a new supply record if none exists
    except Supply.DoesNotExist:
        return Response({'message': 'Supply not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    serializer = SupplySerializer(supply, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_pickup_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    data = request.data
    order.pickup_location = data.get('pickup_location', order.pickup_location)
    order.pickup_date = data.get('pickup_date', order.pickup_date)
    order.status = 'Completed'
    order.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)