import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { updateSupplies } from './supplyUtil';

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

export const updateQueueNumbers = async (selectedPrinterLocation, setOrders) => {
  try {
    console.log('Fetching orders...');
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const orders = await response.json();

    if (response.ok) {
      console.log('Fetched orders:', orders);

      // Filter orders by selectedPrinterLocation
      const filteredOrders = orders.filter(order => order.printer_location === selectedPrinterLocation);
      console.log('Filtered orders:', filteredOrders);

      let queueNumber = 1;
      const updatedOrders = filteredOrders.map(order => {
        if (['Refunded', 'Completed', 'Cancelled'].includes(order.status)) {
          return { ...order, queue_no: null };
        } else if (['Pending', 'For Printing', 'For Pick-up', 'Pending Refund'].includes(order.status)) {
          return { ...order, queue_no: queueNumber++ };
        }
        return order;
      });

      console.log('Updated orders with queue numbers:', updatedOrders);

      const updateResponse = await fetch(`${API_URL}/api/orders/update-queue-numbers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders),
      });

      const updateData = await updateResponse.json();
      if (updateResponse.ok) {
        console.log("Queue numbers updated successfully:", updateData);
        setOrders(updatedOrders); // Update the state with the new orders
      } else {
        console.error('Failed to update queue numbers:', updateData);
      }
    } else {
      console.error('Failed to fetch orders:', orders);
    }
  } catch (error) {
    console.error('Error updating queue numbers:', error);
  }
};

export const handleCancelOrder = async (selectedOrders, selectedPrinterLocation, setOrders) => {
  if (selectedOrders.length === 0) {
    toast.error('Please select orders to cancel.');
    return;
  }
  confirmAlert({
    title: 'Confirm Cancel Orders',
    message: 'Are you sure you want to cancel the selected orders?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_ids: selectedOrders, status: 'Cancelled', remark: null }), // Set remark to null
            });
            const data = await response.json();
            if (response.ok) {
              console.log('Order statuses updated successfully:', data);
              await fetchOrders(selectedPrinterLocation, setOrders); // Fetch orders again to get the updated statuses
              await updateQueueNumbers(selectedPrinterLocation, setOrders); // Update queue numbers after status change
              toast.success('Selected orders cancelled successfully!');
            } else {
              console.error('Failed to update order statuses:', data);
              toast.error('Failed to cancel selected orders');
            }
          } catch (error) {
            console.error('Error cancelling selected orders:', error);
            toast.error('Error cancelling selected orders');
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

export const handleRefundOrders = async (selectedOrders, orders, selectedPrinterLocation, setOrders) => {
  console.log('handleRefundOrders called with selectedOrders:', selectedOrders);
  confirmAlert({
    title: 'Confirm Refund Orders',
    message: 'Are you sure you want to refund the selected orders?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            let refundStatus = 'Refunded';
            // Iterate over selected orders to update TrailPay points for each user
            for (const orderId of selectedOrders) {
              const order = orders.find(order => order.id === orderId);
              if (order) {
                const userEmail = order.email; // Use the correct field name
                console.log(`Fetching user data for ${userEmail}`);
                const userResponse = await fetch(`${API_URL}/api/users/email/?email=${encodeURIComponent(userEmail)}`);
                if (!userResponse.ok) {
                  if (userResponse.status === 404) {
                    throw new Error(`User not found: ${userEmail}`);
                  } else {
                    throw new Error(`Failed to fetch user data for ${userEmail}`);
                  }
                }
                const userData = await userResponse.json();
                const userId = userData.id;
                console.log(`Fetched user data for ${userEmail}:`, userData);

                // Only update TrailPay points if the refund method is TrailPay
                if (order.refund_method === 'TrailPay') {
                  // Calculate refund points based on the order's total price
                  const refundPoints = parseInt(order.total_price, 10); // Ensure refundPoints is an integer
                  const updatedPoints = userData.trailpay_points + refundPoints;
                  console.log(`Updating TrailPay points for ${userEmail} (User ID: ${userId}) to ${updatedPoints}`);

                  const updateResponse = await fetch(`${API_URL}/api/users/refund/${userId}/`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trailpay_points: updatedPoints }),
                  });
                  if (!updateResponse.ok) {
                    throw new Error(`Failed to update TrailPay points for ${userEmail}`);
                  }
                  console.log(`TrailPay points updated successfully for ${userEmail}`);
                }
              }
            }

            // Ensure the status is updated to 'Refunded' if it is 'Pending Refund' or 'Cancelled'
            const ordersToUpdate = selectedOrders.map(orderId => {
              const order = orders.find(order => order.id === orderId);
              if (order && (order.status === 'Pending Refund' || order.status === 'Cancelled')) {
                return orderId;
              }
              return null;
            }).filter(orderId => orderId !== null);

            if (ordersToUpdate.length === 0) {
              toast.dismiss();
              toast.error('No orders to update');
              return;
            }

            console.log(`Updating order statuses to ${refundStatus} for selected orders:`, ordersToUpdate);
            const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                order_ids: ordersToUpdate, 
                status: refundStatus, 
                refund_method: orders.find(order => order.id === ordersToUpdate[0]).refund_method, // Use the actual refund method
                remark: null 
              }),
            });
            const data = await response.json();
            console.log('API response:', data);
            if (response.ok) {
              console.log('Order statuses updated successfully:', data);
              await fetchOrders(selectedPrinterLocation, setOrders); // Fetch orders again to get the updated statuses
              await updateQueueNumbers(selectedPrinterLocation, setOrders); // Update queue numbers after status change
              toast.dismiss();
              toast.success('Selected orders refunded successfully!');
            } else {
              console.error('Failed to update order statuses:', data);
              toast.dismiss();
              toast.error('Failed to refund selected orders');
            }
          } catch (error) {
            console.error('Error refunding selected orders:', error);
            toast.dismiss();
            toast.error(`Error refunding selected orders: ${error.message}`);
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

export const fetchOrders = async (printerLocation, setOrders) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      const filteredOrders = data.filter(order => order.printer_location === printerLocation);
      setOrders(filteredOrders);
    } else {
      console.error('Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

export const handleChangeOrderStatus = async (orderId, currentStatus, setOrders, orders) => {
  let newStatus;
  if (currentStatus === 'Pending') {
    newStatus = 'For Printing';
  } else if (currentStatus === 'For Printing') {
    newStatus = 'For Pick-up';
  } else if (currentStatus === 'For Pick-up') {
    newStatus = 'Completed';
  } else if (currentStatus === 'Cancelled') {
    newStatus = 'Refunded';
  } else if (currentStatus === 'Pending Refund') {
    newStatus = 'Refunded';
  } else {
    return;
  }

  confirmAlert({
    title: 'Confirm Status Change',
    message: `Are you sure you want to change the status to ${newStatus}?`,
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            console.log(`Changing status of order ${orderId} from ${currentStatus} to ${newStatus}`);
            console.log('Request payload:', { status: newStatus });
            const response = await fetch(`${API_URL}/api/orders/${orderId}/change-status/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            console.log('Change status response status:', response.status);
            console.log('Change status response data:', data);
            if (response.ok) {
              console.log('Orders before update:', orders);
              setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
              console.log('Orders after update:', orders);
              toast.success(`Order status changed to ${newStatus}`);
            } else {
              console.error('Failed to change order status:', data);
              toast.error('Failed to change order status');
            }
          } catch (error) {
            console.error('Error changing order status:', error);
            toast.error('Error changing order status');
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

export const handleApproveSelectedOrders = async (selectedOrders, printerLocation, setOrders) => {
  if (selectedOrders.length === 0) {
    toast.error('Please select orders to approve.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const orders = await response.json();
    console.log('Fetched orders:', orders);

    const ordersToApprove = selectedOrders.filter(orderId => {
      const order = orders.find(order => order.id === orderId);
      return order && !order.remark; // Only approve orders with status 'Pending' and empty remarks
    });

    if (ordersToApprove.length === 0) {
      toast.error('No orders to approve. Ensure selected orders have status "Pending" and empty remarks.');
      return;
    }

    console.log('Orders to approve:', ordersToApprove);

    confirmAlert({
      title: 'Confirm to approve',
      message: 'Are you sure you want to approve the selected orders?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            console.log('Approving selected orders:', ordersToApprove);
            try {
              const approveResponse = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_ids: ordersToApprove, status: 'For Printing' }),
              });
              const data = await approveResponse.json();
              if (approveResponse.ok) {
                console.log('Order statuses updated successfully:', data);

                // Handle Trailpay points deduction
                for (const orderId of ordersToApprove) {
                  const order = orders.find(order => order.id === orderId);
                  console.log('Processing order:', order);
                  if (order.payment_method && order.payment_method.toLowerCase() === 'trailpay') {
                    console.log('Order uses Trailpay:', order);
                    const userResponse = await fetch(`${API_URL}/api/users/email/?email=${encodeURIComponent(order.email)}`);
                    const userData = await userResponse.json();
                    console.log('Fetched user data:', userData);
                    if (userData.trailpay_points >= order.total_price) {
                      const updatedPoints = userData.trailpay_points - order.total_price;
                      console.log(`Updating Trailpay points for user ${order.email} from ${userData.trailpay_points} to ${updatedPoints}`);
                      const updatePointsResponse = await fetch(`${API_URL}/api/users/email/?email=${encodeURIComponent(order.email)}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ trailpay_points: updatedPoints }),
                      });
                      if (!updatePointsResponse.ok) {
                        toast.error(`Failed to update Trailpay points for user ${order.email}`);
                      } else {
                        const updatedUserData = await updatePointsResponse.json();
                        console.log(`Updated Trailpay points for user ${order.email}:`, updatedUserData);
                      }
                    } else {
                      toast.error(`User ${order.email} does not have enough Trailpay points`);
                      return;
                    }
                  }
                }

                await fetchOrders(printerLocation, setOrders);
                await updateQueueNumbers(printerLocation, setOrders);
                toast.success('Selected orders approved successfully!');
              } else {
                console.error('Failed to update order statuses:', data);
                toast.error('Failed to approve selected orders');
              }
            } catch (error) {
              console.error('Error approving selected orders:', error);
              toast.error('Error approving selected orders');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error('Error fetching orders');
  }
};


export const handleChangeStatusToPickup = async (selectedOrders, printerLocation, setOrders) => {
  confirmAlert({
    title: 'Confirm to change status',
    message: 'Are you sure you want to change the status of the selected orders to Pick-up?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          console.log('Changing status to Pick-up for selected orders:', selectedOrders);
          try {
            const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_ids: selectedOrders, status: 'For Pick-up' }),
            });
            const data = await response.json();
            if (response.ok) {
              console.log('Order statuses updated successfully:', data);
              await fetchOrders(printerLocation, setOrders);
              await updateQueueNumbers(printerLocation, setOrders);
              toast.success('Selected orders status changed to Pick-up successfully!');
            } else {
              console.error('Failed to update order statuses:', data);
              toast.error('Failed to change status to Pick-up');
            }
          } catch (error) {
            console.error('Error changing status to Pick-up:', error);
            toast.error('Error changing status to Pick-up');
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

export const handleChangeStatusToCompleted = async (selectedOrders, printerLocation, setOrders) => {
  confirmAlert({
    title: 'Confirm to change status',
    message: 'Are you sure you want to change the status of the selected orders to Completed?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          console.log('Changing status to Completed for selected orders:', selectedOrders);
          try {
            const response = await fetch(`${API_URL}/api/orders/change-multiple-statuses/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_ids: selectedOrders, status: 'Completed' }),
            });
            const data = await response.json();
            if (response.ok) {
              console.log('Order statuses updated successfully:', data);

              await fetchOrders(printerLocation, setOrders);
              await updateQueueNumbers(printerLocation, setOrders);

              // Fetch current supply values
              const supplyResponse = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(printerLocation)}/`);
              const currentSupplies = await supplyResponse.json();

              // Update the supply values
              const supplyUpdates = [];
              for (const orderId of selectedOrders) {
                const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
                const order = await orderResponse.json();

                const pages = order.pages * order.copies;

                if (order.document_type === 'A4') {
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/a4_supplies/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ a4_supplies: Math.max(0, currentSupplies.a4_supplies - pages) })
                  }));
                } else if (order.document_type === 'Letter') {
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/letter_supplies/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ letter_supplies: Math.max(0, currentSupplies.letter_supplies - pages) })
                  }));
                } else if (order.document_type === 'Legal') {
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/legal_supplies/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ legal_supplies: Math.max(0, currentSupplies.legal_supplies - pages) })
                  }));
                }

                if (order.print_type === 'Colored') {
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/blue_ink/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ blue_ink: Math.max(0, currentSupplies.blue_ink - pages) })
                  }));
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/yellow_ink/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ yellow_ink: Math.max(0, currentSupplies.yellow_ink - pages) })
                  }));
                  supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/red_ink/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ red_ink: Math.max(0, currentSupplies.red_ink - pages) })
                  }));
                }
                supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(printerLocation)}/black_ink/`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ black_ink: Math.max(0, currentSupplies.black_ink - pages) })
                }));
              }

              await Promise.all(supplyUpdates);

              toast.success('Selected orders status changed to Completed successfully!');
            } else {
              console.error('Failed to update order statuses:', data);
              toast.error('Failed to change status to Completed');
            }
          } catch (error) {
            console.error('Error changing status to Completed:', error);
            toast.error('Error changing status to Completed');
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