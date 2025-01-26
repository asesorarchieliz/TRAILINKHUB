import React, { useState } from 'react';
import './styles/ChangePrintingLocationModal.css';
import closeIcon from '../../assets/close.png';

function ChangePrintingLocationModal({ isOpen, onClose, onSubmit, orderId, recommendedPrinter }) {
  const [printerLocation, setPrinterLocation] = useState(recommendedPrinter);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(orderId, printerLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="changeprinting-modal-overlay">
      <div className="changeprinting-modal-content">
        <button className="changeprinting-modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Change Printing Location</h2>
        <form onSubmit={handleSubmit}>
          <p>Do you want to switch to the recommended printer station: {recommendedPrinter}?</p>
          <div className="changeprinting-form-actions">
            <button type="submit">Yes</button>
            <button type="button" onClick={onClose}>No</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePrintingLocationModal;