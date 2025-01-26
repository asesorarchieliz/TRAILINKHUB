import React, { useState, useEffect } from 'react';
import './styles/TrailpayAdminModal.css';
import PaymentDetailsModal from './PaymentDetailsModal';
import RemarksModal from './RemarksModal';
import RefundMethodModal from './RefundMethodModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import menu from '../../assets/menu.png';
import payment from '../../assets/payment.png';
import { fetchData, filterTransactions, handleApprove, handleCancel, handleRefundMethodSubmit, handleRemarkSubmit, handleDeleteAll, handlePrintReport } from '../../utils/trailpayUtils';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function TrailpayAdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('topUp');
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [isRefundMethodModalOpen, setIsRefundMethodModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState({});
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchData(setStudents, setTransactions, setFilteredTransactions);
  }, []);
  
  useEffect(() => {
    filterTransactions(transactions, filter, startDate, endDate, searchTerm, setFilteredTransactions);
  }, [transactions, filter, startDate, endDate, searchTerm]);

  const handleViewPaymentDetails = (paymentImage, refNumber, name) => {
    setSelectedPaymentDetails({
      paymentImage,
      refNumber,
      modeOfPayment: 'Online',
      name,
    });
    setIsPaymentDetailsModalOpen(true);
  };

  const toggleDropdown = (e, index) => {
    const dropdownContent = e.currentTarget.nextElementSibling;
    const rect = e.currentTarget.getBoundingClientRect();
    if (openDropdown !== null && openDropdown !== index) {
      document.querySelectorAll('.trailpay-dropdown-content').forEach((dropdown) => {
        dropdown.style.display = 'none';
      });
    }
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    dropdownContent.style.top = `${rect.bottom}px`;
    dropdownContent.style.left = `${rect.left}px`;
    setOpenDropdown(dropdownContent.style.display === 'block' ? index : null);
  };

  const handleRefund = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsRefundMethodModalOpen(true);
  };

  const handleRemarks = (transactionId) => {
    setSelectedPaymentDetails({ transactionId });
    setIsRemarksModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePrintReportClick = () => {
    handlePrintReport(transactions, startDate, endDate);
  };

  const handleDeleteAllClick = () => {
    handleDeleteAll(setTransactions, setFilteredTransactions);
  };

  const confirmAction = (action, transactionId, remark) => {
    confirmAlert({
      title: 'Confirm to submit',
      message: `Are you sure you want to ${action}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            if (action === 'approve') {
              handleApprove(transactionId, remark, transactions, setTransactions, filterTransactions, setLoading, setStudents);
              toast.success('Transaction approved successfully!');
            } else if (action === 'cancel') {
              handleCancel(transactionId, transactions, setTransactions, filterTransactions);
              toast.success('Transaction cancelled successfully!');
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

  if (!isOpen) return null;

  return (
    <div className="trailpay-admin-content">
      <div className="trailpay-admin-header">
        <h2>Trailpay</h2>
      </div>
      <div className="trailpay-admin-tabs">
        <button
          className={`trailpay-admin-tab ${activeTab === 'topUp' ? 'active' : ''}`}
          onClick={() => setActiveTab('topUp')}
          style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
        >
          TRAILPAY TOP UP
        </button>
        <button
          className={`trailpay-admin-tab ${activeTab === 'viewPoints' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewPoints')}
          style={{ backgroundColor: 'rgba(255, 255, 0, 0.1)' }}
        >
          VIEW STUDENT POINTS
        </button>
        <button
          className={`trailpay-admin-tab ${activeTab === 'viewTransactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewTransactions')}
          style={{ backgroundColor: 'rgba(0, 0, 255, 0.1)' }}
        >
          VIEW ALL TRANSACTIONS
        </button>
      </div>
      {activeTab === 'topUp' && (
        <>
          <div className="trailpay-admin-filters">
            <button
              className={filter === 'Pending' ? 'active' : ''}
              onClick={() => setFilter('Pending')}
            >
              Pending
            </button>
            <button
              className={filter === 'Completed' ? 'active' : ''}
              onClick={() => setFilter('Completed')}
            >
              Completed
            </button>
            <button
              className={filter === 'Cancelled' ? 'active' : ''}
              onClick={() => setFilter('Cancelled')}
            >
              Cancelled
            </button>
            <button
              className={filter === 'Refunded' ? 'active' : ''}
              onClick={() => setFilter('Refunded')}
            >
              Refunded
            </button>
          </div>
          <div className="trailpay-admin-controls">
            <button className="view-all-button" onClick={() => { setStartDate(null); setEndDate(null); setSearchTerm(''); }}>View All</button>
            <div className="history-date-picker-modal">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="Start Date"
                isClearable
                className="form-control"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="End Date"
                isClearable
                className="form-control"
              />
            </div>
            <input
              type="text"
              placeholder="Search Name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input form-control"
            />
            <button className="print-report-button btn btn-primary" onClick={handlePrintReportClick}>Print Reportorial</button>
            <button className="print-report-button btn btn-danger" onClick={handleDeleteAllClick}>Delete All</button>
          </div>
          <div className="trailpay-admin-table-container table-responsive">
            <table className="trailpay-admin-table table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Top-up Amount</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Refund Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const hasDropdownActions = transaction.status === 'Pending' || transaction.status === 'Cancelled';
                  return (
                    <tr key={transaction.id}>
                      <td>{index + 1}</td>
                      <td>
                        {transaction.status}
                        {transaction.remark && (
                          <div className="remark-text">{transaction.remark}</div>
                        )}
                      </td>
                      <td>{transaction.name}</td>
                      <td>{transaction.top_up_amount}</td>
                      <td>{new Date(transaction.date_time).toLocaleDateString()}</td>
                      <td>{new Date(transaction.date_time).toLocaleTimeString()}</td>
                      <td>{transaction.mode_of_payment}</td>
                      <td>
                        <button className="trailpay-action-button btn btn-info" onClick={() => handleViewPaymentDetails(transaction.payment_image, transaction.ref_number, transaction.name)} disabled={loading}>
                          <img src={payment} alt="View Payment Details" />
                        </button>
                        {hasDropdownActions && (
                          <div className="trailpay-dropdown">
                            <button className="trailpay-action-button btn btn-secondary" onClick={(e) => toggleDropdown(e, index)} disabled={loading}>
                              <img src={menu} alt="Menu" />
                            </button>
                            <div className="trailpay-dropdown-content dropdown-menu">
                              {transaction.status === 'Pending' && (
                                <>
                                  <span className="trailpay-dropdown-item dropdown-item" onClick={() => confirmAction('approve', transaction.id, transaction.remark)} disabled={loading}>Approve</span>
                                  <span className="trailpay-dropdown-item dropdown-item" onClick={() => handleRemarks(transaction.id)} disabled={loading}>Remarks</span>
                                  <span className="trailpay-dropdown-item dropdown-item" onClick={() => confirmAction('cancel', transaction.id)} disabled={loading}>Cancel</span>
                                </>
                              )}
                              {transaction.status === 'Cancelled' && (
                                <span className="trailpay-dropdown-item dropdown-item" onClick={() => handleRefund(transaction.id)} disabled={loading}>Refund</span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {activeTab === 'viewPoints' && (
        <div className="trailpay-admin-view-table-container table-responsive">
          <table className="trailpay-admin-table table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>ID Number</th>
                <th>Email</th>
                <th>Trailpay Points</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.id_number}</td>
                  <td>{student.email}</td>
                  <td>{student.trailpay_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'viewTransactions' && (
        <div className="trailpay-transaction-admin-table-container table-responsive">
          <table className="trailpay-admin-table table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Status</th>
                <th>Name</th>
                <th>Top-up Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Refund Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id}>
                  <td>{index + 1}</td>
                  <td>
                    {transaction.status}
                    {transaction.remark && (
                      <div className="remark-text">{transaction.remark}</div>
                    )}
                  </td>
                  <td>{transaction.name}</td>
                  <td>{transaction.top_up_amount}</td>
                  <td>{new Date(transaction.date_time).toLocaleDateString()}</td>
                  <td>{new Date(transaction.date_time).toLocaleTimeString()}</td>
                  <td>{transaction.refund_method}</td>
                  <td>
                    <button className="btn btn-info" onClick={() => handleViewPaymentDetails(transaction.payment_image, transaction.ref_number, transaction.name)}>
                      View Payment Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaymentDetailsModal
        isOpen={isPaymentDetailsModalOpen}
        onClose={() => setIsPaymentDetailsModalOpen(false)}
        paymentImage={selectedPaymentDetails.paymentImage}
        refNumber={selectedPaymentDetails.refNumber}
        modeOfPayment={selectedPaymentDetails.modeOfPayment}
        name={selectedPaymentDetails.name}
      />
      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        transactionId={selectedPaymentDetails.transactionId}
        onSubmit={(remark) => handleRemarkSubmit(selectedPaymentDetails.transactionId, remark, transactions, setTransactions, filterTransactions, setIsRemarksModalOpen)}
      />
      <RefundMethodModal
        isOpen={isRefundMethodModalOpen}
        onClose={() => setIsRefundMethodModalOpen(false)}
        onSubmit={(method) => handleRefundMethodSubmit(method, selectedTransactionId, transactions, setTransactions, filterTransactions, setIsRefundMethodModalOpen, setFilteredTransactions, setStudents)}
      />
      <ToastContainer />
    </div>
  );
}

export default TrailpayAdminModal;