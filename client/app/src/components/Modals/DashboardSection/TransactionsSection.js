import React, { useEffect, useState } from 'react';
import PaymentDetailsModal from '../PaymentDetailsModal';
import PaymentEditModal from '../PaymentEditModal';
import './styles/TransactionsSection.css'; // Make sure to create and import the CSS file
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function TransactionsSection({ userName }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isPaymentEditModalOpen, setIsPaymentEditModalOpen] = useState(false);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsResponse = await fetch(`${API_URL}/api/transactions/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const transactionsData = await transactionsResponse.json();

        if (transactionsResponse.ok) {
          const userTransactions = transactionsData.filter(transaction => transaction.name === userName);

          // Sort the transactions by date
          const sortedTransactions = userTransactions.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

          setTransactions(sortedTransactions);
          setFilteredTransactions(sortedTransactions);
        } else {
          console.error('Failed to fetch transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userName]);

  const filterTransactions = () => {
    if (filter === 'All') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(transaction => transaction.status === filter));
    }
  };

  const openPaymentDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsPaymentModalOpen(true);
  };

  const closePaymentDetails = () => {
    setIsPaymentModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditSubmit = async (transactionId, topUpAmount, paymentImage) => {
    const MINIMUM_AMOUNT = 100; // Replace with the actual minimum amount required

    if (topUpAmount < MINIMUM_AMOUNT) {
      console.error('Top-up amount does not meet the minimum amount');
      alert(`Top-up amount must be at least P${MINIMUM_AMOUNT}`);
      return;
    }

    const formData = new FormData();
    if (topUpAmount) {
      formData.append('top_up_amount', topUpAmount);
    }
    if (paymentImage) {
      // Upload payment image to Cloudinary
      const formDataForCloudinary = new FormData();
      formDataForCloudinary.append('file', paymentImage);
      formDataForCloudinary.append('upload_preset', 'trailink'); // Replace with your upload preset

      try {
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/djgtuj9zv/image/upload`, {
          method: 'POST',
          body: formDataForCloudinary,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Cloudinary upload error! status: ${uploadResponse.status}, message: ${errorText}`);
        }

        const data = await uploadResponse.json();
        const paymentImageUrl = data.secure_url;
        console.log('Uploaded payment image URL:', paymentImageUrl); // Log the uploaded image URL
        formData.append('payment_image', paymentImageUrl); // Update formData with the Cloudinary URL
      } catch (error) {
        console.error('Error uploading payment image:', error);
        alert(`Error uploading payment image: ${error.message}`);
        return;
      }
    }
    formData.append('remark', ''); // Clear the remark
  
    try {
      const response = await fetch(`${API_URL}/api/transactions/${transactionId}/`, {
        method: 'PATCH',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData); // Log the error response from the server
        throw new Error(errorData.message || 'Failed to update transaction');
      }
  
      const updatedTransaction = await response.json();
      setTransactions(transactions.map(transaction =>
        transaction.id === transactionId ? updatedTransaction : transaction
      ));
      setFilteredTransactions(filteredTransactions.map(transaction =>
        transaction.id === transactionId ? updatedTransaction : transaction
      ));
      setIsPaymentEditModalOpen(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert(`Error updating transaction: ${error.message}`);
    }
  };

  const getTransactionCountByStatus = (status) => {
    return transactions.filter(transaction => transaction.status === status).length;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <h3>Transactions</h3>
      <div className="transaction-filter-container">
        <button
          className={`filter-button ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All ({transactions.length})
        </button>
        <button
          className={`filter-button ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilter('Pending')}
        >
          Pending ({getTransactionCountByStatus('Pending')})
        </button>
        <button
          className={`filter-button ${filter === 'Completed' ? 'active' : ''}`}
          onClick={() => setFilter('Completed')}
        >
          Completed ({getTransactionCountByStatus('Completed')})
        </button>
        <button
          className={`filter-button ${filter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('Cancelled')}
        >
          Cancelled ({getTransactionCountByStatus('Cancelled')})
        </button>
        <button
          className={`filter-button ${filter === 'Refunded' ? 'active' : ''}`}
          onClick={() => setFilter('Refunded')}
        >
          Refunded ({getTransactionCountByStatus('Refunded')})
        </button>
      </div>
      <div className="transaction-section-table-container">
        <table className="transaction-section-table table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={`${transaction.id}-${index}`}>
                <td>{new Date(transaction.date_time).toLocaleDateString()}</td>
                <td>
                  {transaction.status}
                  {transaction.remark && (
                    <div className="remark-text" style={{ color: 'red', fontSize: 'small' }}>
                      {transaction.remark}
                    </div>
                  )}
                </td>
                <td>P{transaction.top_up_amount}</td>
                <td>
                  <button className="btn btn-info" onClick={() => openPaymentDetails(transaction)}>View Payment Details</button>
                  {transaction.remark && (
                    <button className="btn btn-warning" onClick={() => {
                      setCurrentOrderId(transaction.id);
                      setIsPaymentEditModalOpen(true);
                    }}>Change Payment Details</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedTransaction && (
        <PaymentDetailsModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentDetails}
          paymentImage={selectedTransaction.payment_image}
          refNumber={selectedTransaction.ref_number}
          modeOfPayment={selectedTransaction.mode_of_payment}
          name={selectedTransaction.name}
        />
      )}
      <PaymentEditModal
        isOpen={isPaymentEditModalOpen}
        onClose={() => setIsPaymentEditModalOpen(false)}
        transactionId={currentOrderId}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

export default TransactionsSection;