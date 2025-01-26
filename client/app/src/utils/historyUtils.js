import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { saveAs } from 'file-saver';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const handleDownloadReport = (orders, printers, selectedDate) => {
  // Filter orders based on the selected date
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date_time);
    const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    return !selectedDate || order.date_time.startsWith(selectedDateString);
  });

  // Calculate total sales for each printer location
  const printerSales = {};
  filteredOrders.forEach(order => {
    const printerLocation = order.printer_location || 'Unknown';
    const totalPrice = parseFloat(order.total_price);
    if (!printerSales[printerLocation]) {
      printerSales[printerLocation] = { used_count: 0, total_sales: 0 };
    }
    printerSales[printerLocation].used_count += 1;
    printerSales[printerLocation].total_sales += totalPrice;
  });

  // Determine the date to display at the top
  const reportDate = selectedDate ? new Date(selectedDate) : new Date();
  const formattedDate = reportDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Generate report content for order details
  let reportContent = `Sales and Orders Report\nDate: ${formattedDate}\n\n`;
  reportContent += 'Order Details\n';
  reportContent += 'Order ID,User Name,Email,Document Name,Document Type,Pages,Copies,Print Type,Total Price,Date/Time,Printer Location\n';
  filteredOrders.forEach(order => {
    reportContent += `${order.id},${order.user_name},${order.email},${order.document_name},${order.document_type},${order.pages},${order.copies},${order.print_type},${order.total_price},${new Date(order.date_time).toLocaleString()},${order.printer_location || 'Unknown'}\n`;
  });

  // Append printer sales summary to the report content
  reportContent += '\nPrinter Sales Summary\n';
  reportContent += 'Printer Location,Used Count,Total Sales\n';
  for (const printer of printers) {
    const location = printer.location;
    const data = printerSales[location] || { used_count: 0, total_sales: 0 };
    reportContent += `${location},${data.used_count},${data.total_sales.toFixed(2)}\n`;
  }

  // Create a Blob from the report content
  const blob = new Blob([reportContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `sales_report_${selectedDate ? selectedDate.toISOString().split('T')[0] : 'all'}.csv`);
};

export const fetchUsersAndOrders = async (setOrders, setFilteredOrders, setPrinters) => {
  try {
    // Fetch all users
    const usersResponse = await fetch(`${API_URL}/api/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const usersData = await usersResponse.json();

    // Fetch orders
    const ordersResponse = await fetch(`${API_URL}/api/orders/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ordersData = await ordersResponse.json();

    // Fetch printers
    const printersResponse = await fetch(`${API_URL}/api/printers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const printersData = await printersResponse.json();
    setPrinters(printersData);

    // Map orders to include id_number from users
    const ordersWithIdNumber = ordersData.map(order => {
      const user = usersData.find(user => user.email === order.email);
      return { ...order, id_number: user ? user.id_number : null };
    });

    // Filter orders by status
    const filteredOrders = ordersWithIdNumber.filter(order => order.status === 'Completed' || order.status === 'Cancelled');
    setOrders(filteredOrders);
    setFilteredOrders(filteredOrders);
  } catch (error) {
    console.error('Error fetching users, orders, or printers:', error);
  }
};

export const filterOrders = (orders, startDate, endDate, searchTerm, printerLocation, setFilteredOrders) => {
  let filtered = orders;

  if (startDate || endDate) {
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.date_time);
      const isAfterStartDate = startDate ? orderDate >= startDate : true;
      const isBeforeEndDate = endDate ? orderDate <= endDate : true;
      return isAfterStartDate && isBeforeEndDate;
    });
  }

  if (searchTerm) {
    filtered = filtered.filter(order =>
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (printerLocation) {
    filtered = filtered.filter(order => order.printer_location === printerLocation);
  }

  setFilteredOrders(filtered);
};

export const handleViewDocument = (documentUrl) => {
  window.open(documentUrl, '_blank');
};

export const handleViewPaymentDetails = (paymentImage, refNumber) => {
  confirmAlert({
    title: 'Payment Details',
    message: (
      <div style={{ textAlign: 'center' }}>
        <img 
          src={`${API_URL}${paymentImage}`} 
          alt="Payment" 
          style={{ maxWidth: '250px', maxHeight: '250px', display: 'block', margin: '0 auto' }} 
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
        />
        <p style={{ display: 'none' }}>No image</p>
        <p>Reference Number: {refNumber}</p>
      </div>
    ),
    buttons: [
      {
        label: 'Close',
        onClick: () => {}
      }
    ]
  });
};

export const handleDeleteOrder = (orderId, orders, setOrders, filteredOrders, setFilteredOrders) => {
  confirmAlert({
    title: 'Confirm to delete',
    message: 'Are you sure you want to delete this order?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/delete/`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              toast.success('Order deleted successfully');
              setOrders(orders.filter(order => order.id !== orderId));
              setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
            } else {
              toast.error('Failed to delete order');
            }
          } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Error deleting order');
          }
        }
      },
      {
        label: 'No',
        onClick: () => {}
      }
    ]
  });
};

export const handleDeleteAllOrders = (filteredOrders, setOrders, setFilteredOrders) => {
  confirmAlert({
    title: 'Confirm to delete all',
    message: 'Are you sure you want to delete all filtered orders?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            const orderIds = filteredOrders.map(order => order.id);
            const response = await fetch(`${API_URL}/api/orders/delete-multiple/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ order_ids: orderIds }),
            });
            if (response.ok) {
              toast.success('All filtered orders deleted successfully');
              setOrders([]);
              setFilteredOrders([]);
            } else {
              toast.error('Failed to delete all filtered orders');
            }
          } catch (error) {
            console.error('Error deleting all filtered orders:', error);
            toast.error('Error deleting all filtered orders');
          }
        }
      },
      {
        label: 'No',
        onClick: () => {}
      }
    ]
  });
};