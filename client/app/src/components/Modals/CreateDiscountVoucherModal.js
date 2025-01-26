import React, { useState, useEffect, useRef, useContext } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRCodeCanvas } from 'qrcode.react';
import './styles/CreateDiscountVoucherModal.css';
import { UserContext } from '../../context/UserContext'; 

const API_URL = process.env.REACT_APP_API_BASE_URL;

function CreateDiscountVoucherModal({ isOpen, onClose }) {
  const { userEmail, userRole, selectedPrinterLocation } = useContext(UserContext);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [pictureFormat, setPictureFormat] = useState('PNG');
  const [expirationDate, setExpirationDate] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const qrCodeRefs = useRef([]);

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/`);
        const data = await response.json();
        setUsers(data);
        console.log('Fetched Users:', data); // Debugging log
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const getUserNamesByIds = (userIds) => {
    return userIds.map(userId => {
      const user = users.find(user => user.id === parseInt(userId, 10));
      return user ? user.name : '';
    });
  };

  const updateUserStatusToAvailed = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/update-avail-status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avail_status: 'Availed' }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log(`User ${userId} status updated to Availed.`);
    } catch (error) {
      console.error(`Error updating user ${userId} status to Availed:`, error);
    }
  };

  const handleCreate = async () => {
    if (!discountCode || !discountAmount || !expirationDate || selectedUsers.length === 0) {
      toast.error('Please enter discount code, discount amount, expiration date, and select users', { autoClose: 3000 });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (expirationDate < today) {
      toast.error('Expiration date cannot be in the past', { autoClose: 3000 });
      return;
    }

    // Validate discount amount
    const discountAmountPattern = /^\d{1,3}(\.\d{1,2})?$/;
    if (!discountAmountPattern.test(discountAmount)) {
      toast.error('Discount amount must have no more than 3 digits before the decimal point and up to 2 digits after the decimal point', { autoClose: 3000 });
      return;
    }

    // Check if all selected users have an avail_status of "Availing"
    const invalidUsers = selectedUsers.filter(userId => {
      const user = users.find(user => user.id === parseInt(userId, 10));
      return user && user.avail_status !== 'Availing';
    });

    if (invalidUsers.length > 0) {
      toast.error('One or more selected users have not tried to avail yet or alraedy has availed', { autoClose: 3000 });
      return;
    }

    try {
      const checkResponse = await fetch(`${API_URL}/api/discount_vouchers/?discount_code=${discountCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        if (checkResult.exists) {
          toast.error('Discount code already exists', { autoClose: 3000 });
          return;
        }
      } else {
        const errorText = await checkResponse.text();
        console.error('Failed to check discount code:', errorText);
        toast.error('Failed to check discount code', { autoClose: 3000 });
        return;
      }
    } catch (error) {
      console.error('Error checking discount code:', error);
      toast.error('Error checking discount code', { autoClose: 3000 });
      return;
    }

    confirmAlert({
      title: 'Confirm Creation',
      message: 'Are you sure you want to create this discount voucher?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/discount_vouchers/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  discount_code: discountCode,
                  discount_amount: discountAmount,
                  expiry_date: expirationDate,
                  picture_format: pictureFormat,
                  students: selectedUsers,
                }),
              });
              if (response.ok) {
                toast.success('Discount voucher created successfully', { autoClose: 3000 });
                setDiscountCode('');
                setDiscountAmount('');
                setExpirationDate('');
                setSelectedUsers([]);
                onClose();

                // Get selected user names
                const selectedUserNames = getUserNamesByIds(selectedUsers);

                console.log('Selected User Names:', selectedUserNames); // Debugging log

                // Ensure selectedUserNames is not empty
                if (selectedUserNames.length === 0 || selectedUserNames.includes('')) {
                  console.error('Failed to map user IDs to names:', selectedUsers, users);
                  toast.error('Failed to map user IDs to names', { autoClose: 3000 });
                  return;
                }

                // Send discount codes to chat
                const chatResponse = await fetch(`${API_URL}/api/messages/send/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    senderName: 'Admin', // Replace with actual sender
                    receiverNames: selectedUserNames,
                    message: 'Here is your discount voucher QR code',
                    printer_location: selectedPrinterLocation,
                    qr_codes: selectedUsers.map(() => discountCode), // Use discount code as QR code
                  }),
                });

                if (!chatResponse.ok) {
                  const errorText = await chatResponse.text();
                  console.error('Failed to send discount codes to chat:', errorText);
                  toast.error('Failed to send discount codes to chat', { autoClose: 3000 });
                } else {
                  // Update the status of selected users to "Availed"
                  for (const userId of selectedUsers) {
                    await updateUserStatusToAvailed(userId);
                  }
                }
              } else {
                const errorText = await response.text();
                console.error('Failed to create discount voucher:', errorText);
                toast.error(`Failed to create discount voucher: ${errorText}`, { autoClose: 3000 });
              }
            } catch (error) {
              console.error('Error creating discount voucher:', error);
              toast.error(`Error creating discount voucher: ${error.message}`, { autoClose: 3000 });
            }
          }
        },
        {
          label: 'No',
          onClick: () => {
            console.log('Creation cancelled');
          }
        }
      ]
    });
  };

  const handleUserChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value, 10));
      }
    }
    setSelectedUsers(selected);
  };

  const handleDownload = () => {
    const canvas = qrCodeRefs.current[0].querySelector('canvas');
    const url = canvas.toDataURL(`image/${pictureFormat.toLowerCase()}`);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discount_voucher.${pictureFormat.toLowerCase()}`;
    link.click();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (user.avail_status === 'Availing' || user.avail_status === 'Availed')
  );

  if (!isOpen) return null;

  return (
    <div className="discount-voucher-modal">
      <ToastContainer limit={1} autoClose={1000} /> 
      <div className="discount-voucher-modal-content">
        <h2>Create Discount Voucher</h2>
        <div className="discount-voucher-confirm-alert-style">
          <div className="discount-voucher-qr-container" ref={el => qrCodeRefs.current[0] = el}>
            <QRCodeCanvas value={discountCode} size={256} />
            <div className="discount-voucher-download-button-container">
              <button onClick={handleDownload} className="discount-voucher-download-button">Download QR Code</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label>
              Discount Code:
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
            </label>
            <label>
              Discount Amount:
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </label>
            <label>
              Expiration Date:
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </label>
            <label>
              Picture Format:
              <select value={pictureFormat} onChange={(e) => setPictureFormat(e.target.value)}>
                <option value="PNG">PNG</option>
                <option value="JPEG">JPEG</option>
              </select>
            </label>
            <label>
              Search Availing Users:
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name"
              />
            </label>
            <label>
              Select Availing Users:
              <select multiple value={selectedUsers} onChange={handleUserChange} size="5">
                {filteredUsers.map((user, index) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <small>(CTRL+Click to select multiple or deselect)</small>
            </label>
          </div>
        </div>
        <div className="discount-voucher-modal-buttons">
          <button onClick={handleCreate}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default CreateDiscountVoucherModal;