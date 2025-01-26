import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchData = async (setStudents, setTransactions, setFilteredTransactions) => {
  try {
    const studentsResponse = await fetch(`${API_URL}/api/users/`);
    const studentsData = await studentsResponse.json();
    setStudents(studentsData);

    const transactionsResponse = await fetch(`${API_URL}/api/transactions/`);
    const transactionsData = await transactionsResponse.json();
    const sortedTransactions = transactionsData.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    setTransactions(sortedTransactions);
    filterTransactions(sortedTransactions, 'Pending', null, null, '', setFilteredTransactions); // Initial filter call
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const filterTransactions = (transactions, filter, startDate, endDate, searchTerm, setFilteredTransactions) => {
  let filtered = transactions.filter(transaction => transaction.status === filter);
  if (startDate && endDate) {
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.date_time);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }
  if (searchTerm) {
    filtered = filtered.filter(transaction => transaction.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  setFilteredTransactions(filtered);
};

export const handleApprove = async (transactionId, remark, transactions, setTransactions, filterTransactions, setLoading, setStudents, setFilteredTransactions) => {
  if (remark) {
    toast.error('Cannot approve a transaction with a remark.');
    return;
  }
  setLoading(true);
  try {
    const transaction = transactions.find(t => t.id === transactionId);
    const response = await fetch(`${API_URL}/api/transactions/${transactionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Completed' }),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction status');
    }

    const pointsResponse = await fetch(`${API_URL}/api/users/update_points/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: transaction.name, trailpay_points: parseFloat(transaction.top_up_amount) }),
    });

    if (!pointsResponse.ok) {
      throw new Error('Failed to update user points');
    }

    // Refetch transactions and students data
    await fetchData(setStudents, setTransactions, setFilteredTransactions);
  } catch (error) {
    console.error('Error approving transaction:', error);
  } finally {
    setLoading(false);
  }
};

export const handleRemarkSubmit = async (transactionId, remark, transactions, setTransactions, filterTransactions, setIsRemarksModalOpen, setFilteredTransactions) => {
  try {
    await fetch(`${API_URL}/api/transactions/${transactionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remark }),
    });
    setTransactions(transactions.map(transaction => 
      transaction.id === transactionId ? { ...transaction, remark } : transaction
    ));
    setIsRemarksModalOpen(false);
    // Refetch transactions to show the updated remark
    const transactionsResponse = await fetch(`${API_URL}/api/transactions/`);
    const transactionsData = await transactionsResponse.json();
    const sortedTransactions = transactionsData.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    setTransactions(sortedTransactions);
    filterTransactions(sortedTransactions, 'Pending', null, null, '', setFilteredTransactions); // Initial filter call
  } catch (error) {
    console.error('Error adding remark:', error);
  }
};

export const handleCancel = async (transactionId, transactions, setTransactions, filterTransactions, setFilteredTransactions) => {
  try {
    await fetch(`${API_URL}/api/transactions/${transactionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    setTransactions(transactions.map(transaction => 
      transaction.id === transactionId ? { ...transaction, status: 'Cancelled' } : transaction
    ));
    filterTransactions(transactions, 'Cancelled', null, null, '', setFilteredTransactions); // Initial filter call
  } catch (error) {
    console.error('Error canceling transaction:', error);
  }
};

export const handleRefundMethodSubmit = async (method, selectedTransactionId, transactions, setTransactions, filterTransactions, setIsRefundMethodModalOpen, setFilteredTransactions, setStudents) => {
  setIsRefundMethodModalOpen(false);
  try {
    const requestBody = { status: 'Refunded', refund_method: method, mode_of_payment: method };
    const response = await fetch(`${API_URL}/api/transactions/${selectedTransactionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction status');
    }

    if (method === 'TrailPay') {
      const transaction = transactions.find(t => t.id === selectedTransactionId);
      if (transaction) {
        const userName = transaction.name;
        const userResponse = await fetch(`${API_URL}/api/users/name/${userName}/`);
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data for ${userName}`);
        }
        const userData = await userResponse.json();
        const userId = userData.id;
        const currentPoints = parseInt(userData.trailpay_points, 10);
        const refundAmount = parseInt(transaction.top_up_amount, 10);
        const updatedPoints = currentPoints + refundAmount; // Ensure the amount is an integer

        // Log the current points, refund amount, and updated points
        console.log('Current points:', currentPoints);
        console.log('Refund amount:', refundAmount);
        console.log('Updated points:', updatedPoints);

        const updateResponse = await fetch(`${API_URL}/api/users/refund/${userId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trailpay_points: updatedPoints }),
        });
        if (!updateResponse.ok) {
          throw new Error(`Failed to update TrailPay points for ${userName}`);
        }

        // Refetch the user data to update the state
        const updatedUserResponse = await fetch(`${API_URL}/api/users/name/${userName}/`);
        if (!updatedUserResponse.ok) {
          throw new Error(`Failed to refetch user data for ${userName}`);
        }
        const updatedUserData = await updatedUserResponse.json();

        // Update the students state with the new user data
        setStudents(prevStudents => prevStudents.map(student => 
          student.id === userId ? updatedUserData : student
        ));
      }
    }

    setTransactions(transactions.map(transaction => 
      transaction.id === selectedTransactionId ? { ...transaction, status: 'Refunded', mode_of_payment: method } : transaction
    ));
    filterTransactions(transactions, 'Refunded', null, null, '', setFilteredTransactions); // Initial filter call
  } catch (error) {
    console.error('Error refunding transaction:', error);
  }
};

export const handlePrintReport = (transactions, startDate, endDate) => {
  // Filter transactions based on the selected date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date_time);
    return (!startDate || transactionDate >= startDate) && (!endDate || transactionDate <= endDate);
  });

  // Determine the date to display at the top
  const reportDate = new Date();
  const formattedDate = reportDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Generate report content for transaction details
  let reportContent = `Transactions Report\nDate: ${formattedDate}\n\n`;
  reportContent += 'ID,Payment Image,Name,Status,Top-up Amount,Date/Time,Reference Number,Mode of Payment,Remark\n';
  filteredTransactions.forEach(transaction => {
    const formattedDateTime = new Date(transaction.date_time).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
    reportContent += `${transaction.id},${transaction.payment_image || 'N/A'},${transaction.name},${transaction.status},${transaction.top_up_amount},${formattedDateTime},${transaction.ref_number},${transaction.mode_of_payment || 'N/A'},${transaction.remark || 'N/A'}\n`;
  });

  // Create a Blob from the report content
  const blob = new Blob([reportContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `transactions_report_${startDate ? startDate.toISOString().split('T')[0] : 'all'}_${endDate ? endDate.toISOString().split('T')[0] : 'all'}.csv`);
};

export const handleDeleteAll = async (setTransactions, setFilteredTransactions) => {
  try {
    await fetch(`${API_URL}/api/transactions/`, {
      method: 'DELETE',
    });
    setTransactions([]);
    setFilteredTransactions([]);
  } catch (error) {
    console.error('Error deleting all transactions:', error);
  }
};

export const confirmAction = (action, transactionId, remark, transactions, setTransactions, filterTransactions, setLoading, setStudents, setFilteredTransactions) => {
  confirmAlert({
    title: 'Confirm to submit',
    message: `Are you sure you want to ${action}?`,
    buttons: [
      {
        label: 'Yes',
        onClick: () => {
          if (action === 'approve') {
            handleApprove(transactionId, remark, transactions, setTransactions, filterTransactions, setLoading, setStudents, setFilteredTransactions);
          } else if (action === 'cancel') {
            handleCancel(transactionId, transactions, setTransactions, filterTransactions, setFilteredTransactions);
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