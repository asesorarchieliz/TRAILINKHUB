import React, { useState } from 'react';
import './styles/PaymentEditModal.css';

function PaymentEditModal({ isOpen, onClose, transactionId, onSubmit }) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentImage, setPaymentImage] = useState(null);

  const handleTopUpAmountChange = (e) => {
    setTopUpAmount(e.target.value);
  };

  const handlePaymentImageChange = (e) => {
    setPaymentImage(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!topUpAmount && !paymentImage) {
      alert('Please provide a new top-up amount or a new payment image.');
      return;
    }
    onSubmit(transactionId, topUpAmount, paymentImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-edit-modal-overlay">
      <div className="payment-edit-modal-content">
        <h2>Edit Payment Details</h2>
        <div className="payment-edit-modal-body">
          <div className="payment-edit-modal-form-group">
            <label>Change Top-Up Amount</label>
            <input type="number" value={topUpAmount} onChange={handleTopUpAmountChange} />
          </div>
          <div className="payment-edit-modal-form-group">
            <label>Change Payment Image</label>
            <input type="file" onChange={handlePaymentImageChange} />
          </div>
        </div>
        <div className="payment-edit-modal-footer">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default PaymentEditModal;