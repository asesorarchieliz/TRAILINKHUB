import React, { useEffect, useState, useContext } from 'react';
import './styles/OrdersModal.css';
import { UserContext } from '../../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../Modal';
import AddOrderModal from './AddOrderModal';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import closeIcon from '../../assets/close.png';
import FeedbackForm from '../FeedbackForm';
import RefundMethodModal from './RefundMethodModal';
import {
  ORDER_STATUSES,
  fetchUserInfo,
  fetchOrders,
  handleCancelOrder,
  handleRefundOrder,
  handleChangeReferenceImageSubmit,
  handleChangePrintingLocationSubmit,
  handleChangePaymentImageSubmit,
  handleChangeRefundMethodSubmit,
} from '../../utils/userOrderUtils';
import DonateNowModal from './DonateNowModal'; 
import ChangeReferenceImageModal from './ChangeReferenceImageModal'; 
import ChangePrintingLocationModal from './ChangePrintingLocationModal';
import ChangePaymentImageModal from './ChangePaymentImageModal';
import view from '../../assets/view.png';
import payment from '../../assets/payment.png';
import menu from '../../assets/menu.png';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function UserOrdersModal({ onClose }) {
  const [selectedTab, setSelectedTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [totalActiveOrders, setTotalActiveOrders] = useState(0);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isDonateNowModalOpen, setIsDonateNowModalOpen] = useState(false);
  const [isChangeReferenceImageModalOpen, setIsChangeReferenceImageModalOpen] = useState(false);
  const [isChangePrintingLocationModalOpen, setIsChangePrintingLocationModalOpen] = useState(false);
  const [isChangePaymentImageModalOpen, setIsChangePaymentImageModalOpen] = useState(false);
  const [isRefundMethodModalOpen, setIsRefundMethodModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [recommendedPrinter, setRecommendedPrinter] = useState('');
  const { userEmail, modalColor, idNumber, name } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    email: userEmail || '',
    phone: '',
    message: '',
    type: 'feedback',
  });

  const refetchOrders = () => {
    fetchOrders(userEmail, setOrders);
    fetchAllOrders();
  };
  
  const handleCloseAddOrderModal = () => {
    setIsAddOrderModalOpen(false);
    refetchOrders();
  };
  
  const updateQueueNumbers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/update-queue-numbers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update queue numbers:', errorData);
        return;
      }
  
      const data = await response.json();
      console.log("Queue numbers updated successfully:", data);
  
      // Fetch orders again to get the updated queue numbers
      await fetchOrders(userEmail, setOrders);
    } catch (error) {
      console.error('Error updating queue numbers:', error);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Filter out orders with statuses that should not be included in the total count
        const activeOrders = data.filter(order => !['For Pick-up', 'Cancelled', 'Refunded', 'Completed', 'Pending Refund'].includes(order.status));
        setTotalActiveOrders(activeOrders.length);
      } else {
        console.error('Failed to fetch all orders:', data);
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo(userEmail, setFormData);
  }, [userEmail]);

  useEffect(() => {
    fetchOrders(userEmail, setOrders).then(() => {
      updateQueueNumbers();
      fetchAllOrders();
    });
  }, [userEmail]);

  const getOrderCount = (status) => {
    if (status === 'All') {
      return orders.length;
    }
    return orders.filter(order => order.status === status).length;
  };

  const toggleDropdown = (e) => {
    const dropdownContent = e.currentTarget.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  };

  const closeDropdown = (e) => {
    const dropdownContent = e.currentTarget.parentElement;
    dropdownContent.style.display = 'none';
  };

  const parseRemarkForTotalPrice = (remark) => {
    if (!remark) return null;
    const match = remark.match(/Changed total price to (\d+)/);
    return match ? parseFloat(match[1]) : null;
  };

  const handleConfirmChangeTotalPrice = (order, newTotalPrice) => {
    confirmAlert({
      title: 'Confirm Change Total Price',
      message: `Do you want to change the total price to P${newTotalPrice}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/orders/${order.id}/update-total-price/`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ total_price: newTotalPrice, remark: '' }),
              });
              if (!response.ok) {
                throw new Error('Failed to update total price');
              }
              toast.success('Total price updated successfully!');
              refetchOrders();
            } catch (error) {
              console.error('Error updating total price:', error);
              toast.error('Failed to update total price.');
            }
          }
        },
        {
          label: 'No',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/orders/${order.id}/update-total-price/`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ remark: '' }),
              });
              if (!response.ok) {
                throw new Error('Failed to update remark');
              }
              toast.success('Remark removed successfully!');
              refetchOrders();
            } catch (error) {
              console.error('Error removing remark:', error);
              toast.error('Failed to remove remark.');
            }
          }
        }
      ]
    });
  };

  const renderOrders = () => {
    const statusPriority = {
      'Pending': 1,
      'For Printing': 2,
      'For Pick-up': 3,
      'Pending Refund': 4,
      'Refunded': 5,
      'Completed': 6,
      'Cancelled': 7
    };
  
    const sortedOrders = orders
      .filter(order => selectedTab === 'All' || order.status === selectedTab)
      .sort((a, b) => {
        const statusComparison = statusPriority[a.status] - statusPriority[b.status];
        if (statusComparison !== 0) return statusComparison;
        return new Date(a.date_time) - new Date(b.date_time);
      });
  
    return sortedOrders.map((order) => {
      let recommendedPrinter = '';
      if (order.remark && order.remark.includes("Recommended Printer Station")) {
        const match = order.remark.match(/Recommended Printer Station:\s*(\w+)$/);
        if (match) {
          recommendedPrinter = match[1];
        }
      }

      const newTotalPrice = parseRemarkForTotalPrice(order.remark);
  
      return (
        <tr key={order.id}>
          <td className="order-number">{order.queue_no ? `${order.queue_no}` : '-'}</td>
          <td className="document-details-column">
            <div>{order.document_name}</div>
            <div>{order.document_type}<br />{order.print_type}</div>
            {order.remark && <div className="remark">Remark: {order.remark}</div>}
            {order.status === 'For Pick-up' && order.printer_location && (
              <div className="printing-location">
                Printing Location: {order.printer_location}
              </div>
            )}
          </td>
          <td>
            <div>{order.pages} Pages<br />{order.copies} Copies</div>
          </td>
          <td>{order.printer_location}</td>
          <td>{order.printer_name}</td>
          <td>P{order.total_price}</td>
          <td>{new Date(order.date_time).toISOString().replace('T', ' ').slice(0, 19)}</td>
          <td>{new Date(order.pick_up_time_date).toISOString().replace('T', ' ').slice(0, 19)}</td>
          <td>{order.status}</td>
          <td>{order.payment_method}</td>
          <td>{order.refund_method}</td>
          <td className="actions-column">
            <div className="orders-dropdown">
              <button className="action-button" onClick={toggleDropdown}>
                <img src={menu} alt="Menu" />
              </button>
              <div className="orders-dropdown-content">
                {order.status === 'Cancelled' && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => confirmAddRefundMethod(order.id)}>Add Refund Method</span>
                    <span className="orders-dropdown-item" onClick={() => confirmRefundOrder(order.id)}>Request Refund</span>
                  </>
                )}
                {order.status === 'For Pick-up' && (
                  <span className="orders-dropdown-item" onClick={() => setIsDonateNowModalOpen(true)}>Donate Now</span>
                )}
                {order.status !== 'Cancelled' && order.status !== 'Completed' && order.status !== 'For Printing' && order.status !== 'Refunded' && order.status !== 'Pending Refund' && order.status !== 'For Pick-up' && (
                  <span className="orders-dropdown-item" onClick={() => confirmCancelOrder(order.id)}>Cancel Order</span>
                )}
                {order.remark && order.remark.includes("Reference number doesn't match") && (
                  <span className="orders-dropdown-item" onClick={() => {
                    setCurrentOrderId(order.id);
                    setIsChangeReferenceImageModalOpen(true);
                  }}>Change Reference Image</span>
                )}
                {order.remark && order.remark.includes("The proof of payment is blurred") && (
                  <span className="orders-dropdown-item" onClick={() => {
                    setCurrentOrderId(order.id);
                    setIsChangePaymentImageModalOpen(true);
                  }}>Change Payment Image</span>
                )}
                {order.remark && order.remark.includes("Recommended Printer Station") && (
                  <span className="orders-dropdown-item" onClick={() => {
                    setCurrentOrderId(order.id);
                    setRecommendedPrinter(recommendedPrinter);
                    setIsChangePrintingLocationModalOpen(true);
                  }}>Change Printing Location</span>
                )}
                {order.remark && !order.remark.includes("Reference number doesn't match") && !order.remark.includes("The proof of payment is blurred") && !order.remark.includes("Recommended Printer Station") && (
                  <>
                    <span className="orders-dropdown-item" onClick={() => {
                      setCurrentOrderId(order.id);
                      setIsChangeReferenceImageModalOpen(true);
                    }}>Change Reference Image</span>
                    <span className="orders-dropdown-item" onClick={() => {
                      setCurrentOrderId(order.id);
                      setIsChangePaymentImageModalOpen(true);
                    }}>Change Payment Image</span>
                  </>
                )}
                {newTotalPrice !== null && (
                  <span className="orders-dropdown-item" onClick={() => handleConfirmChangeTotalPrice(order, newTotalPrice)}>Change Total Price</span>
                )}
                <span className="orders-dropdown-item close-dropdown" onClick={closeDropdown}>Close</span>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  const confirmCancelOrder = (orderId) => {
    confirmAlert({
      title: 'Confirm to cancel',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            const feedback = null;
              await handleCancelOrder(orderId, feedback, userEmail, setOrders, toast, async (feedback) => {
                // Submit feedback logic here
                console.log('Feedback submitted:', feedback);
              });
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleRefundMethodSubmit = async (refundMethod) => {
    try {
      await handleChangeRefundMethodSubmit(currentOrderId, refundMethod, userEmail, setOrders);
      toast.dismiss(); // Dismiss any existing toasts
      toast.success('Refund method added successfully!');
      refetchOrders();
    } catch (error) {
      console.error('Error adding refund method:', error);
      toast.dismiss(); // Dismiss any existing toasts
      toast.error('Failed to add refund method.');
    }
  };

  const confirmAddRefundMethod = (orderId) => {
    setCurrentOrderId(orderId);
    setIsRefundMethodModalOpen(true);
  };

  const confirmRefundOrder = (orderId) => {
    const order = orders.find(order => order.id === orderId);
    if (!order.refund_method) {
      toast.error('Cannot request a refund without a refund method.');
      return;
    }
  
    confirmAlert({
      title: 'Confirm Refund',
      message: 'Are you sure you want to request a refund for this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await handleRefundOrder(orderId, {}, userEmail, setOrders, toast);
              toast.success('Refund requested successfully!');
              refetchOrders();
            } catch (error) {
              console.error('Error requesting refund:', error);
              toast.error('Failed to request refund.');
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

  const handleCloseOrdersModal = () => {
    onClose();
  };

  const isAnyModalOpen = isAddOrderModalOpen || isDonateNowModalOpen || isChangeReferenceImageModalOpen || isChangePrintingLocationModalOpen || isChangePaymentImageModalOpen || isRefundMethodModalOpen;

  return (
    <div>
      {!isAddOrderModalOpen && (
        <div className="orders-modal" style={{ backgroundColor: modalColor, minHeight: isAnyModalOpen ? '0' : '620px' }}>
          <button className="modal-close" onClick={handleCloseOrdersModal}>
            <img src={closeIcon} alt="Close" />
          </button>
          <h2>{selectedTab} Orders</h2>
          <button className="add-order-button" onClick={() => setIsAddOrderModalOpen(true)}>Add Order</button>
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
          <div className="users-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th className="order-number-header">Queue No.</th>
                  <th>Document Details</th>
                  <th>Print Type</th>
                  <th>Printer Location</th>
                  <th>Printer Name</th>
                  <th>Total Price</th>
                  <th>Date/Time</th>
                  <th>Pick-up Date/Time</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Refund Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderOrders()}
              </tbody>
            </table>
          </div>
          <ToastContainer />
          {isDonateNowModalOpen && <DonateNowModal isOpen={isDonateNowModalOpen} onClose={() => setIsDonateNowModalOpen(false)} />}
          {isChangeReferenceImageModalOpen && (
            <ChangeReferenceImageModal
              isOpen={isChangeReferenceImageModalOpen}
              onClose={() => setIsChangeReferenceImageModalOpen(false)}
              onSubmit={(data) => {
                handleChangeReferenceImageSubmit(data).then(() => refetchOrders());
              }}
              orderId={currentOrderId}
            />
          )}
          {isChangePrintingLocationModalOpen && (
            <ChangePrintingLocationModal
              isOpen={isChangePrintingLocationModalOpen}
              onClose={() => setIsChangePrintingLocationModalOpen(false)}
              onSubmit={(data) => {
                handleChangePrintingLocationSubmit(data).then(() => refetchOrders());
              }}
              orderId={currentOrderId}
              recommendedPrinter={recommendedPrinter}
            />
          )}
          {isChangePaymentImageModalOpen && (
            <ChangePaymentImageModal
              isOpen={isChangePaymentImageModalOpen}
              onClose={() => setIsChangePaymentImageModalOpen(false)}
              onSubmit={(data) => {
                handleChangePaymentImageSubmit(data).then(() => refetchOrders());
              }}
              orderId={currentOrderId}
            />
          )}
          {isRefundMethodModalOpen && (
            <RefundMethodModal
              isOpen={isRefundMethodModalOpen}
              onClose={() => setIsRefundMethodModalOpen(false)}
              onSubmit={handleRefundMethodSubmit}
            />
          )}
        </div>
      )}
      {isAddOrderModalOpen && (
        <Modal isOpen={isAddOrderModalOpen} onClose={handleCloseAddOrderModal} content="Add Order">
          <AddOrderModal />
        </Modal>
      )}
      <DonateNowModal isOpen={isDonateNowModalOpen} onClose={() => setIsDonateNowModalOpen(false)} />
    </div>
  );
}

export default UserOrdersModal;