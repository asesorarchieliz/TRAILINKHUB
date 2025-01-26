import React, { useEffect, useState, useContext } from 'react';
import './styles/OrdersModal.css';
import { UserContext } from '../../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import closeIcon from '../../assets/close.png';
import { updateQueueNumbers, fetchOrders, handleApproveSelectedOrders, 
  handleChangeStatusToCompleted, handleCancelOrder, handleRefundOrders, ORDER_STATUSES } from '../../utils/adminOrderUtils';
import { sendPickupNotification } from '../../utils/smsUtils'; // Import the SMS utility function
import DonateNowModal from './DonateNowModal';
import AddRemarkModal from './AddRemarkModal';
import AddCancelledRemarkModal from './AddCancelledRemarkModal';
import PDFViewer from '../../utils/pdfViewerUtils';
import PickupFormModal from '../PickupFormModal'; // Import the PickupFormModal
import view from '../../assets/view.png';
import payment from '../../assets/payment.png';
import menu from '../../assets/menu.png';
import printing from '../../assets/printing.png';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AdminOrdersModal({ onClose }) {
  const [selectedTab, setSelectedTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const { userEmail, selectedPrinterLocation } = useContext(UserContext);
  const [isDonateNowModalOpen, setIsDonateNowModalOpen] = useState(false);
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [isAddCancelledRemarkModalOpen, setIsAddCancelledRemarkModalOpen] = useState(false);
  const [isRefundMethodModalOpen, setIsRefundMethodModalOpen] = useState(false);
  const [isPickupFormModalOpen, setIsPickupFormModalOpen] = useState(false); // State for PickupFormModal
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendNotification = async (orderId) => {
    try {
      const order = orders.find(order => order.id === orderId);
      if (order && order.email) {
        console.log('Fetching user details for email:', order.email);
        const userResponse = await fetch(`${API_URL}/api/users/?email=${order.email}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data fetched from API:', userData);
          const user = userData.find(u => u.email === order.email); // Ensure we get the correct user by email
          console.log('Filtered user data:', user);
          if (user && user.phone) {
            await sendPickupNotification(user.phone, {
              id: order.id,
              customer_name: user.name, // Pass the customer name
              printer_location: order.printer_location || order.printer_name, // Use printer_name if printer_location is not available
              pick_up_time_date: order.pick_up_time_date || order.pickup_date, // Use pick_up_time_date if pickup_date is not available
            });
            toast.success('Notification sent successfully');
          } else {
            toast.error('User phone number not found');
          }
        } else {
          toast.error('Failed to fetch user details');
        }
      } else {
        toast.error('Order email not available');
      }
    } catch (error) {
      toast.error('Failed to send notification');
      console.error('Error sending notification:', error);
    }
  };

  const handleChangeStatusToPickup = async (orderId) => {
    try {
      console.log('Updating order status to For Pick-up for orderId:', orderId);
      const response = await fetch(`${API_URL}/api/orders/${orderId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'For Pick-up' }),
      });
      console.log('Response from order status update:', response);
      if (response.ok) {
        toast.success('Order status updated to For Pick-up');
        await fetchOrders(selectedPrinterLocation, setOrders);
        await updateQueueNumbers(selectedPrinterLocation, setOrders);
      } else {
        toast.error('Failed to update order status');
        console.error('Failed to update order status:', response.statusText);
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };
  
  const handlePrint = (documentUrl) => {
    const printWindow = window.open(documentUrl, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleViewOrDownloadDocument = (documentUrl) => {
    console.log('handleViewOrDownloadDocument called with URL:', documentUrl);
    setPdfUrl(documentUrl); // Set the PDF URL to display the PDF in the modal
  };

  useEffect(() => {
    const fetchAndUpdateOrders = async () => {
      await fetchOrders(selectedPrinterLocation, setOrders);
      await updateQueueNumbers(selectedPrinterLocation, setOrders);
    };
    fetchAndUpdateOrders();
  }, [selectedPrinterLocation]);

  const getOrderCount = (status) => {
    if (!Array.isArray(orders)) return 0;
    return status === 'All' ? orders.length : orders.filter(order => order.status === status).length;
  };

  const handleViewPaymentDetails = (paymentImage, refNumber) => {
    toast.info(
      <div style={{ textAlign: 'center' }}>
        <img
          src={paymentImage}
          alt="Payment"
          style={{ maxWidth: '250px', maxHeight: '250px', display: 'block', margin: '0 auto' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <p style={{ display: 'none' }}>No image</p>
        <p>Reference Number: {refNumber}</p>
      </div>,
      { autoClose: false }
    );
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleAddRemark = (orderId) => {
    setCurrentOrderId(orderId);
    setIsAddRemarkModalOpen(true);
  };

  const handleAddCancelledRemark = (orderId) => {
    setCurrentOrderId(orderId);
    setIsAddCancelledRemarkModalOpen(true);
  };

  const handleRemarkSubmit = async (orderId, combinedRemark) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark: combinedRemark }),
      });
      if (response.ok) {
        toast.success('Remark added successfully');
        await fetchOrders(selectedPrinterLocation, setOrders);
        await updateQueueNumbers(selectedPrinterLocation, setOrders); // Update queue numbers after remark submission
      } else {
        toast.error('Failed to add remark');
      }
    } catch (error) {
      toast.error('Failed to add remark');
    }
  };

  const handleRefundOrder = async (orderId) => {
    console.log('handleRefundOrder called with orderId:', orderId); // Add this log
    const selectedOrder = orders.find(order => order.id === orderId);
    if (!selectedOrder.payment_method) {
      toast.error('Cannot request a refund without a payment method.');
      return;
    }
    if (!selectedOrder.refund_method) {
      toast.error('Cannot request a refund without a refund method.');
      return;
    }

    console.log('Refund confirmed for orderId:', orderId); // Add this log
    try {
      await handleRefundOrders([orderId], orders, selectedPrinterLocation, setOrders);
      await fetchOrders(selectedPrinterLocation, setOrders);
      await updateQueueNumbers(selectedPrinterLocation, setOrders);
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to request refund.');
    }
  };

  const handlePickupFormSubmit = async (orderId, pickupLocation, pickupDate) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/update-pickup-details/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickup_location: pickupLocation, pickup_date: pickupDate }),
      });
      if (response.ok) {
        toast.success('Pickup details updated successfully');
        await fetchOrders(selectedPrinterLocation, setOrders);
        await updateQueueNumbers(selectedPrinterLocation, setOrders);
  
        // Fetch current supply values
        console.log('Fetching current supply values...');
        const supplyResponse = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(selectedPrinterLocation)}/`);
        const currentSupplies = await supplyResponse.json();
        console.log('Current supplies:', currentSupplies);
  
        // Fetch the order details
        console.log('Fetching order details...');
        const orderResponse = await fetch(`${API_URL}/api/orders/${orderId}/`);
        const order = await orderResponse.json();
        console.log('Processing order:', order);
  
        const pages = order.pages * order.copies;
        console.log('Pages to deduct:', pages);
  
        const supplyUpdates = [];
  
        if (order.document_type === 'A4') {
          const newA4Supplies = Math.max(0, currentSupplies.a4_supplies - pages);
          console.log(`Updating A4 supplies: ${currentSupplies.a4_supplies} - ${pages} = ${newA4Supplies}`);
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/a4_supplies/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ a4_supplies: newA4Supplies })
          }));
        } else if (order.document_type === 'Letter') {
          const newLetterSupplies = Math.max(0, currentSupplies.letter_supplies - pages);
          console.log(`Updating Letter supplies: ${currentSupplies.letter_supplies} - ${pages} = ${newLetterSupplies}`);
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/letter_supplies/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ letter_supplies: newLetterSupplies })
          }));
        } else if (order.document_type === 'Legal') {
          const newLegalSupplies = Math.max(0, currentSupplies.legal_supplies - pages);
          console.log(`Updating Legal supplies: ${currentSupplies.legal_supplies} - ${pages} = ${newLegalSupplies}`);
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/legal_supplies/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ legal_supplies: newLegalSupplies })
          }));
        }
  
        if (order.print_type === 'Colored') {
          const newBlueInk = Math.max(0, currentSupplies.blue_ink - pages);
          const newYellowInk = Math.max(0, currentSupplies.yellow_ink - pages);
          const newRedInk = Math.max(0, currentSupplies.red_ink - pages);
          console.log(`Updating Blue ink: ${currentSupplies.blue_ink} - ${pages} = ${newBlueInk}`);
          console.log(`Updating Yellow ink: ${currentSupplies.yellow_ink} - ${pages} = ${newYellowInk}`);
          console.log(`Updating Red ink: ${currentSupplies.red_ink} - ${pages} = ${newRedInk}`);
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/blue_ink/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blue_ink: newBlueInk })
          }));
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/yellow_ink/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ yellow_ink: newYellowInk })
          }));
          supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/red_ink/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ red_ink: newRedInk })
          }));
        }
        const newBlackInk = Math.max(0, currentSupplies.black_ink - pages);
        console.log(`Updating Black ink: ${currentSupplies.black_ink} - ${pages} = ${newBlackInk}`);
        supplyUpdates.push(fetch(`${API_URL}/api/supply/update/${encodeURIComponent(selectedPrinterLocation)}/black_ink/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ black_ink: newBlackInk })
        }));
  
        console.log('Sending supply update requests...');
        const supplyUpdateResponses = await Promise.all(supplyUpdates);
        supplyUpdateResponses.forEach(async (response, index) => {
          const responseData = await response.json();
          if (!response.ok) {
            console.error(`Failed to update supply for update ${index}:`, responseData);
          } else {
            console.log(`Supply update ${index} successful:`, responseData);
          }
        });
  
        toast.success('Order status updated to Completed and supplies updated successfully');
      } else {
        toast.error('Failed to update pickup details');
      }
    } catch (error) {
      toast.error('Failed to update pickup details');
      console.error('Error updating pickup details:', error);
    }
  };

  const toggleDropdown = (e) => {
    const dropdownContent = e.currentTarget.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  };

  const closeDropdown = (e) => {
    const dropdownContent = e.currentTarget.parentElement;
    dropdownContent.style.display = 'none';
  };

  const renderOrders = () => {
    if (!Array.isArray(orders)) return null;
    let filteredOrders = orders;
  
    if (selectedTab !== 'All') {
      filteredOrders = orders.filter(order => order.status === selectedTab);
    }
  
    const statusPriority = {
      'Pending': 1,
      'For Printing': 2,
      'For Pick-up': 3,
      'Pending Refund': 4,
      'Refunded': 5,
      'Completed': 6,
      'Cancelled': 7
    };
  
    const sortedOrders = filteredOrders.sort((a, b) => {
      const statusComparison = statusPriority[a.status] - statusPriority[b.status];
      if (statusComparison !== 0) return statusComparison;
      return new Date(a.date_time) - new Date(b.date_time);
    });
  
    const relevantStatuses = ['Pending', 'For Printing', 'For Pick-up'];
    const relevantOrders = orders.filter(order => relevantStatuses.includes(order.status));
    const totalRelevantOrders = relevantOrders.length;
  
    return sortedOrders.map(order => {
      const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          hour12: true,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };
  
      return (
        <tr key={order.id}>
          <td className="order-number">
            {order.queue_no && relevantStatuses.includes(order.status) && order.queue_no <= totalRelevantOrders ? `${order.queue_no}` : '-'}
          </td>
          <td>{order.user_name}</td>
          <td className="document-details-column">
            <div>{order.document_name}</div>
            <div>{order.document_type}<br />{order.print_type}</div>
            {order.remark && <div className="remark">Remark: {order.remark}</div>}
          </td>
          <td>
            <div>{order.pages} Pages<br />{order.copies} Copies</div>
          </td>
          <td>{order.printer_location}</td>
          <td>P{order.total_price}</td>
          <td>{formatDateTime(order.date_time)}</td>
          <td>{formatDateTime(order.pick_up_time_date)}</td>
          <td>
            {order.status}
            {order.status === 'For Pick-up' && (
              <div>
                <div>Pickup Location: {order.pickup_location}</div>
                <div>Pickup Date: {formatDateTime(order.pickup_date)}</div>
              </div>
            )}
          </td>
          <td>
            {order.status === 'Pending' || order.status === 'For Printing' ? order.payment_method : order.refund_method}
          </td>
          <td className="admin-actions-column">
            {!isMobile && order.status === 'Pending' && (
              <button className="action-button" onClick={() => window.open(order.document_url, '_blank')}>
                <img src={view} alt="View Document" />
              </button>
            )}
            {!isMobile && (order.status === 'For Printing' || order.status === 'For Pick-up') && (
              <button className="action-button" onClick={() => handleViewOrDownloadDocument(order.document_url)}>
                <img src={printing} alt="Print Document" />
              </button>
            )}
            {!isMobile && (
              <button className="action-button" onClick={() => handleViewPaymentDetails(order.payment_image, order.ref_number)}>
                <img src={payment} alt="View Payment Details" />
              </button>
            )}
            <div className="orders-dropdown">
              <button className="action-button" onClick={toggleDropdown}>
                <img src={menu} alt="Menu" />
              </button>
              <div className="orders-dropdown-content">
                {isMobile && (
                  <>
                    {order.status === 'Pending' && (
                      <span className="orders-dropdown-item" onClick={() => window.open(order.document_url, '_blank')}>View Document</span>
                    )}
                    {(order.status === 'For Printing' || order.status === 'For Pick-up') && (
                      <span className="orders-dropdown-item" onClick={() => handleViewOrDownloadDocument(order.document_url)}>Print Document</span>
                    )}
                    <span className="orders-dropdown-item" onClick={() => handleViewPaymentDetails(order.payment_image, order.ref_number)}>View Payment Details</span>
                  </>
                )}
                {order.status === 'Pending' && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => handleAddRemark(order.id)}>Add Pending Remark</span>
                    <span className="orders-dropdown-item" onClick={() => handleApproveSelectedOrders([order.id], selectedPrinterLocation, setOrders)}>Approve Order</span>
                    <span className="orders-dropdown-item" onClick={() => handleCancelOrder([order.id], selectedPrinterLocation, setOrders)}>Cancel Order</span>
                  </>
                )}
                {order.status === 'For Printing' && (
                  <span className="orders-dropdown-item" onClick={() => handleChangeStatusToPickup(order.id)}>Change Status to Pick Up</span>
                )}
                {order.status === 'For Pick-up' && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => {
                      setCurrentOrderId(order.id);
                      setIsPickupFormModalOpen(true);
                    }}>Change Status to Completed</span>
                    <span className="orders-dropdown-item" onClick={() => handleSendNotification(order.id)}>Send Notification</span>
                  </>
                )}
                {order.status === 'Pending Refund' && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => handleRefundOrder(order.id)}>Refund Order</span>
                    <span className="orders-dropdown-item" onClick={() => handleCancelOrder([order.id], selectedPrinterLocation, setOrders)}>Cancel Order</span>
                  </>
                )}
                {order.status === 'Cancelled' && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => handleAddCancelledRemark(order.id)}>Add Cancel Remark</span>
                    <span className="orders-dropdown-item" onClick={() => handleRefundOrder(order.id)}>Refund Order</span>
                  </>
                )}
                {order.status === 'Refunded' && (
                  <span className="orders-dropdown-item" onClick={() => handleChangeStatusToCompleted([order.id], selectedPrinterLocation, setOrders)}>Change Status to Completed</span>
                )}
                <span className="orders-dropdown-item close-dropdown" onClick={closeDropdown}>Close</span>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  const handleCloseOrdersModal = () => {
    onClose();
  };

  return (
    <div className="orders-modal">
      <button className="modal-close" onClick={handleCloseOrdersModal}>
        <img src={closeIcon} alt="Close" />
      </button>
      <h2>{selectedTab} Orders</h2>
      <div className="tabs">
        <button className={selectedTab === 'All' ? 'active' : ''} onClick={() => setSelectedTab('All')}>
          All ({getOrderCount('All')})
        </button>
        {ORDER_STATUSES.map(status => (
          <button
            key={status}
            className={selectedTab === status ? 'active' : ''} 
            onClick={() => setSelectedTab(status)}
          >
            {status} ({getOrderCount(status)})
          </button>
        ))}
      </div>
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="order-number-header">Queue No.</th>
              <th>User</th>
              <th className="document-details-column">Document Details</th>
              <th>Print Details</th>
              <th>Printer Locations</th>
              <th>Total Price</th>
              <th>Date & Time</th>
              <th>Pick-up Date & Time</th>
              <th>Status</th>
              <th>Payment/Refund Method</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>{renderOrders()}</tbody>
        </table>
      </div>
      <ToastContainer />
      {isDonateNowModalOpen && <DonateNowModal isOpen={isDonateNowModalOpen} onClose={() => setIsDonateNowModalOpen(false)} />}
      {isAddRemarkModalOpen && (
        <AddRemarkModal
          isOpen={isAddRemarkModalOpen}
          onClose={() => setIsAddRemarkModalOpen(false)}
          onSubmit={handleRemarkSubmit}
          orderId={currentOrderId}
        />
      )}
      {isAddCancelledRemarkModalOpen && (
        <AddCancelledRemarkModal
          isOpen={isAddCancelledRemarkModalOpen}
          onClose={() => setIsAddCancelledRemarkModalOpen(false)}
          onSubmit={handleRemarkSubmit}
          orderId={currentOrderId}
        />
      )}
      {isPickupFormModalOpen && (
        <PickupFormModal
          isOpen={isPickupFormModalOpen}
          onClose={() => setIsPickupFormModalOpen(false)}
          onSubmit={handlePickupFormSubmit}
          orderId={currentOrderId}
        />
      )}
      {pdfUrl && (
        <div className="pdf-viewer-modal">
          <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
          <button className="modal-close" onClick={() => setPdfUrl(null)}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersModal;