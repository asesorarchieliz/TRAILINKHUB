import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const ORDER_STATUSES = [
  'Pending',
  'For Printing',
  'For Pick-up',
  'Cancelled',
  'Pending Refund',
  'Refunded',
  'Completed'
];

export const fetchUserInfo = async (userEmail, setFormData) => {
  if (userEmail) {
    try {
      console.log('Fetching user information for email:', userEmail);
      const response = await fetch(`${API_URL}/api/users/email?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseText = await response.text();
      console.log('Response text:', responseText);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = JSON.parse(responseText);
      console.log('Fetched user information:', data);
      setFormData((prevData) => ({
        ...prevData,
        name: data.name,
        phone: data.phone,
      }));
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  }
};

export const fetchOrders = async (userEmail, setOrders) => {
  console.log('Fetching orders for user:', userEmail);
  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Fetched orders:', data);
    const userOrders = data.filter(order => order.email === userEmail);
    console.log('Filtered user orders:', userOrders);
    userOrders.forEach(order => {
      console.log(`Order ID: ${order.id}, Queue No: ${order.queue_no}`);
    });

    // Update queue numbers
    await updateQueueNumbers(userOrders);

    if (typeof setOrders === 'function') {
      setOrders(userOrders);
    } else {
      console.error('setOrders is not a function. Received:', setOrders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

export const updateQueueNumbers = async (orders) => {
  try {
    // Filter out orders with statuses that should not be included in the queue number assignment
    const filteredOrders = orders.filter(order => !['For Pick-up', 'Cancelled', 'Refunded', 'Completed'].includes(order.status));

    // Sort orders by their creation date or ID to ensure a consistent order
    filteredOrders.sort((a, b) => a.id - b.id);

    // Reassign queue numbers sequentially
    const updatedOrders = filteredOrders.map((order, index) => ({
      ...order,
      queue_no: index + 1,
    }));

    // Update orders with new queue numbers
    for (const order of updatedOrders) {
      const response = await fetch(`${API_URL}/api/orders/${order.id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queue_no: order.queue_no }),
      });

      if (!response.ok) {
        console.error(`Failed to update order ${order.id}:`, await response.text());
      }
    }

    console.log("Queue numbers updated successfully");
  } catch (error) {
    console.error('Error updating queue numbers:', error);
  }
};

export const handleCancelOrder = async (orderId, feedback, userEmail, setOrders, toast, submitFeedback) => {
  let newStatus = 'Cancelled'; // Define newStatus outside the try block
  try {
    const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
    const orderData = await orderResponse.json();

    if (orderData.payment_method === 'Trailpay') {
      newStatus = 'Completed';
    }

    const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_ids: [orderId],
        status: newStatus,
        remark: feedback,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    toast.success(`Order ${newStatus.toLowerCase()} successfully!`);
    await submitFeedback(feedback);
    await fetchOrders(userEmail, setOrders); // Ensure orders are refetched after cancellation
  } catch (error) {
    console.error(`Error ${newStatus.toLowerCase()} order:`, error);
    toast.error(`Failed to ${newStatus.toLowerCase()} order.`);
  }
};

export const handleRefundOrder = async (orderId, formData, userEmail, setOrders, toast) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/change-status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Pending Refund' }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.success('Order status updated to Pending Refund successfully!');
    fetchOrders(userEmail, setOrders);
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Failed to update order status.');
  }
};

export const handleChangeReferenceImageSubmit = async (orderId, newReferenceImage, userEmail, setOrders) => {
  try {
    console.log('Updating reference image for order:', orderId); // Debugging statement
    const formDataToSend = new FormData();
    formDataToSend.append('payment_image', newReferenceImage);

    // Fetch the current order to get the existing remark
    const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
    const orderData = await orderResponse.json();

    // Remove the "Reference number doesn't match" part from the remark
    let updatedRemark = orderData.remark.replace(/Reference number doesn't match\s*-\s*/, '').trim();

    // If the only remark left is "Reference number doesn't match", remove the remark entirely
    if (updatedRemark === "Reference number doesn't match") {
      updatedRemark = '';
    }

    formDataToSend.append('remark', updatedRemark);

    const response = await fetch(`${API_URL}/api/orders/${orderId}/update/`, {
      method: 'PUT',
      body: formDataToSend,
    });
    console.log('Response status:', response.status); // Debugging statement
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.success('Reference image updated successfully');
    await fetchOrders(userEmail, setOrders); // Refresh the orders list
  } catch (error) {
    console.error('Error updating reference image:', error);
    toast.error('Failed to update reference image');
  }
  await fetchOrders(userEmail, setOrders);
};

export const handleChangePrintingLocationSubmit = async (orderId, userEmail, setOrders) => {
  try {
    // Fetch the current order to get the existing remark
    const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
    const orderData = await orderResponse.json();

    // Extract the new printer location from the remark
    let newPrinterLocation = '';
    const match = orderData.remark.match(/Recommended Printer Station:\s*(\w+)$/);
    if (match) {
      newPrinterLocation = match[1];
    }

    // Remove the "Recommended Printer Station: EPSON" part from the remark
    let updatedRemark = orderData.remark.replace(/-\s*Recommended Printer Station:\s*\w+$/, '').trim();

    if (updatedRemark.startsWith("Recommended Printer Station")) {
      updatedRemark = '';
    }

    const response = await fetch(`${API_URL}/api/orders/${orderId}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ printer_location: newPrinterLocation, remark: updatedRemark }),
    });
    if (response.ok) {
      toast.success('Printing location updated successfully');
      await fetchOrders(userEmail, setOrders); // Refresh the orders list
    } else {
      toast.error('Failed to update printing location');
    }
  } catch (error) {
    toast.error('Failed to update printing location');
  }
};

export const handleChangeRefundMethodSubmit = async (orderId, refundMethod, userEmail, setOrders) => {
  try {
    console.log('Updating refund method for order:', orderId); // Debugging statement

    const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_ids: [orderId], refund_method: refundMethod, status: 'Cancelled' }), // Include a default status
    });
    const data = await response.json();
    console.log('Response status:', response.status); // Debugging statement
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.success('Refund method updated successfully');
    await fetchOrders(userEmail, setOrders); // Refresh the orders list
  } catch (error) {
    console.error('Error updating refund method:', error);
    toast.error('Failed to update refund method');
  }
};

export const handleChangePaymentImageSubmit = async (orderId, newPaymentImage, userEmail, setOrders) => {
  try {
    console.log('Updating payment image for order:', orderId); // Debugging statement
    const formDataToSend = new FormData();
    formDataToSend.append('payment_image', newPaymentImage);

    // Fetch the current order to get the existing remark
    const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
    const orderData = await orderResponse.json();

    // Remove the "The proof of payment is blurred image" part from the remark
    let updatedRemark = orderData.remark.replace(/The proof of payment is blurred image\s*-\s*/, '').trim();

    // If the only remark left is "The proof of payment is blurred image", remove the remark entirely
    if (updatedRemark === "The proof of payment is blurred image") {
      updatedRemark = '';
    }

    formDataToSend.append('remark', updatedRemark);

    const response = await fetch(`${API_URL}/api/orders/${orderId}/update/`, {
      method: 'PUT',
      body: formDataToSend,
    });
    console.log('Response status:', response.status); // Debugging statement
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.success('Payment image updated successfully');
    await fetchOrders(userEmail, setOrders); // Refresh the orders list
  } catch (error) {
    console.error('Error updating payment image:', error);
    toast.error('Failed to update payment image');
  }
  await fetchOrders(userEmail, setOrders);
};