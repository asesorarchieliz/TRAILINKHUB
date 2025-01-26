import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchUserData = async (userEmail, setUserName, setIsFreePrintingAvailed, setTotalPrice, setTrailpayPoints) => {
  try {
    const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setUserName(data.name); // Assuming the response contains a 'name' field
    setIsFreePrintingAvailed(data.isFreePrintingAvailed);
    setTrailpayPoints(data.trailpay_points);

    console.log('isFreePrintingAvailed:', data.isFreePrintingAvailed);

    return data; // Return the data
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null; // Return null in case of error
  }
};

export const fetchDiscountVouchers = async (setDiscountVouchers) => {
  try {
    const response = await fetch(`${API_URL}/api/discount_vouchers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setDiscountVouchers(data);
  } catch (error) {
    console.error('Error fetching discount vouchers:', error);
  }
};

export const updateUserFreePrinting = async (email) => {
  try {
    const updateResponse = await fetch(`${API_URL}/api/users/email/?email=${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isFreePrintingUsed: true }),
    });

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    console.log('User information updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating user information:', error);
    return false;
  }
};

export const updateUserTrailpayPoints = async (email, updatedPoints) => {
  try {
    const updateResponse = await fetch(`${API_URL}/api/users/email/?email=${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trailpay_points: updatedPoints }),
    });

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    console.log('Trailpay points updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating Trailpay points:', error);
    return false;
  }
};

export const calculateTotalPrice = (pages, copies, colorOption, type, discountAmount = 0) => {
  let pricePerPage = 0;

  if (colorOption === 'Black and White') {
    if (type === 'Text Only') {
      pricePerPage = 3;
    } else if (type === 'Text with Images') {
      pricePerPage = 7;
    } else if (type === 'Images Only') {
      pricePerPage = 4;
    } else if (type === 'Images with Small Text') {
      pricePerPage = 6;
    }
  } else if (colorOption === 'Colored') {
    if (type === 'Images with Small Text') {
      pricePerPage = 8;
    } else if (type === 'Text with Images') {
      pricePerPage = 9;
    } else if (type === 'Images Only') {
      pricePerPage = 5;
    }
  }

  const total = pages * copies * pricePerPage;
  return Math.max(0, total - parseFloat(discountAmount));
};

export const handleSubmit = async (formData, userEmail, updateUserFreePrinting, onClose, discountVoucherId, referenceNumber) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/create/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you use token-based authentication
      },
    });

    if (response.ok) {
      const orderData = await response.json(); // Get the created order data
      const orderId = orderData.id; // Assuming the response contains the order ID

      // Update the queue numbers for all orders
      const queueResponse = await fetch(`${API_URL}/api/orders/update-queue-numbers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!queueResponse.ok) {
        throw new Error(`HTTP error! status: ${queueResponse.status}`);
      }

      console.log('Queue numbers updated successfully.');

      // Update the user's isFreePrintingUsed field
      const updateSuccess = await updateUserFreePrinting(userEmail);
      if (!updateSuccess) {
        throw new Error('Failed to update user information.');
      }

      // Update supplies
      const suppliesUpdated = await updateSupplies(orderId);
      if (!suppliesUpdated) {
        throw new Error('Failed to update supplies.');
      }

      // Update discount voucher status if a discount voucher was used
      if (discountVoucherId) {
        const voucherUpdated = await updateDiscountVoucherStatus(discountVoucherId);
        if (!voucherUpdated) {
          throw new Error('Failed to update discount voucher status.');
        }
      }

      console.log('Order and supplies updated successfully.');
      toast.success('Order submitted successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      const errorData = await response.json();
      console.error('Error submitting order:', errorData);

      // Display errors using toast.error
      if (errorData.print_type) {
        errorData.print_type.forEach((error) => toast.error(`Print Type: ${error}`));
      }
      if (errorData.payment_image) {
        errorData.payment_image.forEach((error) => toast.error(`Payment Image: ${error}`));
      }
      toast.error('Error submitting order.');
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    toast.error('Error submitting order.');
  }
};

export const confirmSubmit = (e, handleSubmit) => {
  e.preventDefault();
  confirmAlert({
    title: 'Confirm to submit',
    message: 'Are you sure you want to submit this order?',
    buttons: [
      {
        label: 'Yes',
        onClick: () => handleSubmit()
      },
      {
        label: 'No',
        onClick: () => {}
      }
    ]
  });
};

export const handleFileChange = async (e, setProofOfPayment, setProofOfPaymentPreview) => {
  const file = e.target.files[0];
  if (file) {
    setProofOfPayment(file);
    setProofOfPaymentPreview(URL.createObjectURL(file));
  }
};

export const handleDiscountCodeChange = (e, setDiscountCode) => {
  setDiscountCode(e.target.value);
};

export const checkDiscountCode = (discountCode, discountVouchers, totalPrice, setTotalPrice, setDiscountCode, setDiscountVoucherId) => {
  const voucher = discountVouchers.find(voucher => voucher.discount_code === discountCode);
  if (voucher && !voucher.is_used) {
    const discountedPrice = Math.max(0, totalPrice - parseFloat(voucher.discount_amount));
    setTotalPrice(discountedPrice);
    setDiscountVoucherId(voucher.id); // Store the voucher ID
    toast.success(`Discount applied: ${voucher.discount_amount} PHP`);
  } else {
    setDiscountCode('');
    toast.error('Expired, used, or invalid discount code.');
  }
};

export const updateSupplies = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/api/supply/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Supplies updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating supplies:', error);
    return false;
  }
};

export const updateDiscountVoucherStatus = async (voucherId) => {
  try {
    const response = await fetch(`${API_URL}/api/discount_vouchers/${voucherId}/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_used: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Discount voucher status updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating discount voucher status:', error);
    return false;
  }
};