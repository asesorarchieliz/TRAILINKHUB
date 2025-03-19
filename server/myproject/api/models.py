from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    id_number = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    course = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    year = models.CharField(max_length=20)
    password = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=100, default='student')
    profileImage = models.URLField(max_length=200, null=True, blank=True)
    isFreePrintingAvailed = models.BooleanField(default=False)
    isFreePrintingUsed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=True)
    isForgetPassword = models.BooleanField(default=False)
    last_free_printing_availment = models.DateTimeField(null=True, blank=True, default=None) 
    last_login = models.DateTimeField(blank=True, null=True)
    modalColor = models.CharField(max_length=20, default='#dbf8ff')
    secondaryModalColor = models.CharField(max_length=20, default='#f4f4f4')
    trailpay_points = models.PositiveIntegerField(default=0)
    avail_count = models.PositiveIntegerField(default=0)
    fontColor = models.CharField(max_length=20, default='#000000')
    avail_status = models.CharField(max_length=20, default='Not availed')

    def get_email_field_name(self):
        return 'email'
    
    def __str__(self):
        return self.username

class Admin(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=100, default='admin')
    profileImage = models.URLField(max_length=200, null=True, blank=True)
    college_level = models.CharField(max_length=100, null=True, blank=True)
    student_id = models.CharField(max_length=100, null=True, blank=True)
    program = models.CharField(max_length=100, null=True, blank=True)
    
    # Schedule fields
    monday_start = models.TimeField(blank=True, null=True)
    monday_end = models.TimeField(blank=True, null=True)
    monday_is_vacant = models.BooleanField(default=False)
    
    tuesday_start = models.TimeField(blank=True, null=True)
    tuesday_end = models.TimeField(blank=True, null=True)
    tuesday_is_vacant = models.BooleanField(default=False)
    
    wednesday_start = models.TimeField(blank=True, null=True)
    wednesday_end = models.TimeField(blank=True, null=True)
    wednesday_is_vacant = models.BooleanField(default=False)
    
    thursday_start = models.TimeField(blank=True, null=True)
    thursday_end = models.TimeField(blank=True, null=True)
    thursday_is_vacant = models.BooleanField(default=False)
    
    friday_start = models.TimeField(blank=True, null=True)
    friday_end = models.TimeField(blank=True, null=True)
    friday_is_vacant = models.BooleanField(default=False)
    
    saturday_start = models.TimeField(blank=True, null=True)
    saturday_end = models.TimeField(blank=True, null=True)
    saturday_is_vacant = models.BooleanField(default=False)
    
    sunday_start = models.TimeField(blank=True, null=True)
    sunday_end = models.TimeField(blank=True, null=True)
    sunday_is_vacant = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Printer(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive')], default='active')
    brand = models.CharField(max_length=100, default='Brand', blank=True, null=True)
    location = models.CharField(max_length=255)
    used_count = models.PositiveIntegerField(default=0, blank=True, null=True)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)
    status_estimated_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('A4', 'A4'),
        ('Letter', 'Letter'),
        ('Legal', 'Legal'),
    ]
    PRINT_TYPE_CHOICES = [
        ('Black and White', 'Black and White'),
        ('Colored', 'Colored'),
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('For Printing', 'For Printing'),
        ('For Pick-up', 'For Pick-up'),
        ('Cancelled', 'Cancelled'),
        ('Pending Refund', 'Pending Refund'),
        ('Pending Payment', 'Pending Payment'),
        ('Refunded', 'Refunded'),
    ]
    TYPE_CHOICES = [
        ('Text Only', 'Text Only'),
        ('Text with Images', 'Text with Images'),
        ('Images Only', 'Images Only'),
        ('Images with Small Text', 'Images with Small Text'),
    ]
    
    REFUND_METHOD_CHOICES = [
        ('F2F', 'Face to Face'),
        ('TrailPay', 'TrailPay'),
        ('GCash', 'GCash'),
        ('Other', 'Other Online Method'),
    ]
        
    user_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    document_name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='A4')
    pages = models.PositiveIntegerField()
    copies = models.PositiveIntegerField()
    print_type = models.CharField(max_length=20, choices=PRINT_TYPE_CHOICES, default='Black and White')
    type = models.CharField(max_length=40, choices=TYPE_CHOICES, default='Text Only') 
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    date_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    availed_free_printing = models.BooleanField(default=False)
    document_url = models.URLField(max_length=500, blank=True, null=True)  # Changed to URLField
    payment_image = models.URLField(max_length=200, null=True, blank=True)
    ref_number = models.CharField(max_length=100, blank=True, null=True)
    discount_code = models.CharField(max_length=100, blank=True, null=True)
    queue_no = models.IntegerField(null=True, blank=True)
    printer_name = models.CharField(default="Printer", max_length=100)
    printer_location = models.CharField(max_length=255, blank=True, null=True)
    remark = models.TextField(blank=True, null=True, default=None)
    refund_method = models.CharField(max_length=100, blank=True, null=True)
    pick_up_time_date = models.DateTimeField(blank=True, null=True, default=timezone.now)
    payment_method = models.CharField(max_length=100, blank=True, null=True)
    pickup_location = models.CharField(max_length=255, blank=True, null=True)
    pickup_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Order {self.document_name} by {self.user_name} - Status: {self.status}"

class Supply(models.Model):
    a4_supplies = models.PositiveIntegerField(default=0)
    letter_supplies = models.PositiveIntegerField(default=0)
    legal_supplies = models.PositiveIntegerField(default=0)
    blue_ink = models.PositiveIntegerField(default=0)
    yellow_ink = models.PositiveIntegerField(default=0)
    red_ink = models.PositiveIntegerField(default=0)
    black_ink = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    printer_location = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Supply updated at {self.updated_at}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()
    type = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Message from {self.name} ({self.email})"
    
class RequestRefund(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    gcash_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund request for Order {self.order.id}"
    
class Logs(models.Model):
    date_time = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=100, null=True, blank=True)
    activity = models.CharField(max_length=300)
    role = models.CharField(max_length=100, default='student')
    year = models.CharField(max_length=10, null=True, blank=True)
    signature = models.URLField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.activity} at {self.date_time}"
    
class Transaction(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Refunded', 'Refunded'),
    ]

    name = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    top_up_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_time = models.DateTimeField(default=timezone.now)
    payment_image = models.URLField(max_length=200, null=True, blank=True)
    ref_number = models.CharField(max_length=100, null=True, blank=True)
    mode_of_payment = models.CharField(max_length=100, null=True, blank=True)
    remark = models.TextField(blank=True, null=True, default=None)

    def __str__(self):
        return f"{self.name} - {self.status}"

class DiscountVoucher(models.Model):
    discount_code = models.CharField(max_length=100, unique=True)
    discount_amount = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)  # Add this field
    expiry_date = models.DateTimeField(default=timezone.now)
    picture_format = models.CharField(max_length=100, default='png')
    students = models.ManyToManyField(User, related_name='vouchers')

    def __str__(self):
        return self.discount_code

class Message(models.Model):
    sender = models.CharField(max_length=100)
    receiver = models.CharField(max_length=100)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    printer_location = models.CharField(max_length=100, null=True, blank=True)
    qr_code = models.URLField(max_length=200, null=True, blank=True)
    seen = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.sender} to {self.receiver} at {self.timestamp}'