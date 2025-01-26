import React, { useEffect, useState, useContext } from 'react';
import './styles/HistoryModal.css';
import { UserContext } from '../../context/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Corrected import path
import closeIcon from '../../assets/close.png';
import { confirmAlert } from 'react-confirm-alert';
import { fetchUsersAndOrders, filterOrders, handleViewDocument, handleViewPaymentDetails, handleDeleteOrder, handleDeleteAllOrders, handleDownloadReport } from '../../utils/historyUtils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function HistoryModal() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { userEmail, selectedPrinterLocation } = useContext(UserContext);

  useEffect(() => {
    fetchUsersAndOrders(setOrders, setFilteredOrders, setPrinters);
  }, [userEmail]);

  useEffect(() => {
    filterOrders(orders, startDate, endDate, searchTerm, selectedPrinterLocation, setFilteredOrders);
  }, [orders, startDate, endDate, searchTerm, selectedPrinterLocation]);

  const renderOrders = () => {
    return filteredOrders.map((order, index) => (
      <tr key={order.id}>
        <td>{order.status}</td>
        <td>{order.id_number}</td>
        <td>{order.user_name}</td>
        <td>
          <div>{order.document_name}</div>
          <div>{order.document_type} | {order.pages} Pages | {order.copies} Copies</div>
          <div>{order.print_type} | {order.is_text_only ? 'Text Only' : 'Includes Images'}</div>
        </td>
        <td>{order.total_price}</td>
        <td>{new Date(order.date_time).toLocaleString()}</td>
        <td>
          <span className="history-action-link" onClick={() => handleViewDocument(order.document_url)}>View Document</span>
          <span className="history-action-link" onClick={() => handleViewPaymentDetails(order.payment_image, order.ref_number)}>View Payment Details</span>
        </td>
      </tr>
    ));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="history-modal">
      <h2>Order History</h2>
      <div className="history-controls">
        <button className="view-all-button" onClick={() => { setStartDate(null); setEndDate(null); setSearchTerm(''); }}>View All</button>
        <div className="history-date-picker-modal">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="Start Date"
            showClearButton={false} // Remove clear button
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="End Date"
            showClearButton={false} // Remove clear button
          />
        </div>
        <input
          type="text"
          placeholder="Search Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button className="print-report-button" onClick={() => handleDownloadReport(filteredOrders, printers, startDate, endDate)}>Print Reportorial</button>
        <button className="print-report-button" onClick={() => handleDeleteAllOrders(filteredOrders, setOrders, setFilteredOrders)}>Delete All</button>
      </div>
      <div className="table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>ID Number</th>
              <th>Full Name</th>
              <th>Order Details</th>
              <th>Total Price</th>
              <th>Date/Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {renderOrders()}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
}

export default HistoryModal;