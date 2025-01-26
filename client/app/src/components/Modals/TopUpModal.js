import React, { useState, useEffect } from 'react';
import './styles/TopUpModal.css';
import closeIcon from '../../assets/close.png';

function TopUpModal({ isOpen, onClose, onSubmit, userName }) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('gcash');
  const [paymentImage, setPaymentImage] = useState(null);

  useEffect(() => {
    console.log('UserName:', userName); // Log userName to verify
  }, [userName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', userName); // Include name in the form data
    formData.append('top_up_amount', topUpAmount);
    formData.append('ref_number', refNumber);
    formData.append('mode_of_payment', modeOfPayment);
    if (paymentImage) {
      formData.append('payment_image', paymentImage);
    }
    console.log('Form Data:', Object.fromEntries(formData.entries())); // Log form data
    onSubmit(formData);
    onClose();
  };

  const handleImageChange = (e) => {
    setPaymentImage(e.target.files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="top-up-overlay">
      <div className="top-up-modal">
        <button className="top-up-modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Top Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="top-up-form-group">
            <label htmlFor="topUpAmount">Top Up Amount:</label>
            <input
              type="number"
              id="topUpAmount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              required
            />
          </div>
          <div className="top-up-form-group">
            <label htmlFor="refNumber">Reference Number:</label>
            <input
              type="text"
              id="refNumber"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              required
            />
          </div>
          <div className="top-up-form-group">
            <label htmlFor="modeOfPayment">Mode of Payment:</label>
            <select
              id="modeOfPayment"
              value={modeOfPayment}
              onChange={(e) => setModeOfPayment(e.target.value)}
              required
            >
              <option value="gcash">GCash</option>
              <option value="paymongo">PayMongo</option>
              <option value="gotyme">GoTyme</option>
            </select>
          </div>
          <div className="top-up-form-group">
            <label htmlFor="paymentImage">Payment Image:</label>
            <input
              type="file"
              id="paymentImage"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit" className="top-up-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default TopUpModal;