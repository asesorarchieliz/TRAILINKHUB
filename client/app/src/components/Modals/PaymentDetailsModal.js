import React from 'react';
import './styles/PaymentDetailsModal.css';
import closeIcon from '../../assets/close.png';

function PaymentDetailsModal({ isOpen, onClose, paymentImage, refNumber, modeOfPayment, name }) {
  if (!isOpen) return null;

  console.log('Full Payment Image URL:', paymentImage); // Log the full image URL

  return (
    <div className="payment-details-overlay">
      <div className="payment-details-modal">
        <button className="payment-close-button" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Payment Details</h2>
        <hr />
        <div className="payment-details-content">
          <div className="payment-image">
            <img src={paymentImage} alt="Payment" />
          </div>
          <div className="payment-info">
            <p><strong>Reference Number:</strong> {refNumber}</p>
            <p><strong>Mode of Payment:</strong> {modeOfPayment}</p>
            <p><strong>Name:</strong> {name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsModal;