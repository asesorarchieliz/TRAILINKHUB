from django.urls import path
from .order_views import (
    create_order, get_all_orders, get_order, update_order, delete_order, update_supply, 
    cancel_order, change_order_status, update_queue_numbers, change_multiple_order_statuses, delete_multiple_orders,
    update_order_total_price, update_pickup_details
)
from .user_views import (
    update_avail_status, password_reset, get_user_by_name, get_all_users, clear_users, delete_user, block_user, 
    get_user_by_email, forget_password, reset_free_printing, password_reset_request, password_reset_confirm, 
    get_all_admins, update_schedule, update_user_color, get_user_by_id, update_secondary_color, update_font_color, delete_user,
    refund_user_points, get_admin_by_name
)
from .auth_views import signup, login, admin_login, admin_change_password, admin_signup, check_username
from .views import contact_us, create_discount_voucher, request_refund, update_discount_voucher
from .printer_views import printer_list, printer_detail, add_location, delete_location, update_printer_usage
from .log_views import logs_view, log_book_view
from .transaction_view import transactions_list, transaction_detail, update_points
from .voucher_views import delete_voucher
from .chat_views import ( 
    get_messages, send_message, get_message, get_users_for_printer, update_message_names, mark_messages_as_seen,
    get_unseen_messages_count, 
    )

from .admin_views import edit_admin, delete_admin, get_admin_by_email
from .supply_views import ( 
    update_supply_field, update_multiple_supply_fields, get_all_supplies, 
    get_or_create_supply_by_printer_location, update_supply_field_by_location
    )

urlpatterns = [
    # Auth URLs
    path('signup/', signup, name='signup'),
    path('admin_signup/', admin_signup, name='admin_signup'),
    path('login/', login, name='login'),
    path('admin_login/', admin_login, name='admin_login'),
    path('admin-change-password/', admin_change_password, name='admin_change_password'),
    path('check-username/', check_username, name='check-username'),

    # User URLs
    path('users/', get_all_users, name='get_all_users'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/<int:user_id>/', get_user_by_id, name='get_user_by_id'),
    path('users/name/<str:name>/', get_user_by_name, name='get_user_by_name'),
    path('users/email/', get_user_by_email, name='get_user_by_email'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/<int:user_id>/block/', block_user, name='block_user'),
    path('users/<int:user_id>/update-avail-status/', update_avail_status, name='update_avail_status'),
    path('users/update-color/', update_user_color, name='update-user-color'),
    path('users/update-secondary-color/', update_secondary_color, name='update-secondary-color'),
    path('users/update-font-color/', update_font_color, name='update-font-color'),
    path('users/update_points/', update_points, name='update-points'),
    path('users/refund/<int:user_id>/', refund_user_points, name='refund_user_points'),  # Updated URL
    path('clear_users/', clear_users, name='clear_users'),
    path('forget-password/', forget_password, name='forget_password'),
    path('password-reset/', password_reset, name='password_reset'),
    path('password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    path('reset-free-printing/', reset_free_printing, name='reset_free_printing'),

    # Admin URLs
    path('admins/', get_all_admins, name='get_all_admins'),
    path('admins/email/<str:email>/', get_admin_by_email, name='get_admin_by_email'),
    path('admins/<int:admin_id>/update_schedule/', update_schedule, name='update_schedule'),
    path('admins/<int:admin_id>/update/', edit_admin, name='edit_admin'),
    path('admins/<int:admin_id>/delete/', delete_admin, name='delete_admin'),
    path('admins/name/<str:name>/', get_admin_by_name, name='get_admin_by_name'),
    
    # Order URLs
    path('orders/', get_all_orders, name='get_all_orders'),
    path('orders/create/', create_order, name='create_order'),
    path('orders/<int:order_id>/', get_order, name='get_order'),
    path('orders/<int:order_id>/update/', update_order, name='update_order'),
    path('orders/<int:order_id>/delete/', delete_order, name='delete_order'),
    path('orders/<int:order_id>/cancel/', cancel_order, name='cancel_order'),
    path('orders/<int:order_id>/change-status/', change_order_status, name='change_order_status'),
    path('orders/update-queue-numbers/', update_queue_numbers, name='update_queue_numbers'),
    path('orders/change-multiple-statuses/', change_multiple_order_statuses, name='change_multiple_order_statuses'),
    path('orders/delete-multiple/', delete_multiple_orders, name='delete_multiple_orders'),
    path('orders/<int:order_id>/update-total-price/', update_order_total_price, name='update_order_total_price'),
    path('orders/<int:order_id>/update-pickup-details/', update_pickup_details, name='update-pickup-details'),

    # Printer URLs
    path('printers/', printer_list, name='printer-list'),
    path('printers/<int:pk>', printer_detail, name='printer-detail'),
    path('printers/<int:pk>/update-usage/', update_printer_usage, name='update_printer_usage'),
    path('locations/', add_location, name='locations'),
    path('locations/<str:location>/', delete_location, name='delete_location'),

    # Supply URLs
    path('supply/update/', update_supply, name='update_supply'),
    path('supply/', get_all_supplies, name='get_all_supplies'),
    path('supply/update/<int:pk>/<str:field_name>/', update_supply_field, name='update_supply_field'),
    path('supply/update/<int:pk>/', update_multiple_supply_fields, name='update_multiple_supply_fields'),
    path('supply/printer/<str:printer_location>/', get_or_create_supply_by_printer_location, name='get_or_create_supply_by_printer_location'),
    path('supply/update/<str:printer_location>/<str:field_name>/', update_supply_field_by_location, name='update_supply_field_by_location'),
    
    # Transaction URLs
    path('transactions/', transactions_list, name='transactions-list'),
    path('transactions/<int:pk>/', transaction_detail, name='transaction-detail'),

    # Voucher URLs
    path('discount_vouchers/', create_discount_voucher, name='create_discount_voucher'),
    path('discount_vouchers/<int:voucher_id>/update/', update_discount_voucher, name='update_discount_voucher'),
    path('delete_voucher/<str:discount_code>/', delete_voucher, name='delete_voucher'),

    # Chat URLs
    path('messages/', get_messages, name='get_messages'),
    path('messages/<int:message_id>/', get_message, name='get_message'),
    path('messages/send/', send_message, name='send_message'),
    path('messages/users/<str:printer_name>/', get_users_for_printer, name='get_users_for_printer'),
    path('messages/update_names/', update_message_names, name='update_message_names'),
    path('messages/mark_as_seen/', mark_messages_as_seen, name='mark_messages_as_seen'),
    path('messages/unseen_count/', get_unseen_messages_count, name='get_unseen_messages_count'),
    
    # Log URLs
    path('logs/', logs_view, name='logs-view'),
    path('log_book/', log_book_view, name='log_book_view'),

    # Other URLs
    path('contact-us/', contact_us, name='contact_us'),
    path('request-refund/', request_refund, name='request_refund'),
]