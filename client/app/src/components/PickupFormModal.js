import React, { useState } from 'react';
import './styles/PickupFormModal.css';

function PickupFormModal({ isOpen, onClose, onSubmit, orderId }) {
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const handleSubmit = () => {
    onSubmit(orderId, pickupLocation, pickupDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pickup-form-modal">
      <div className="pickup-form-modal-content">
        <h2>Pickup Details</h2>
        <div className="pickup-form-group">
          <label>Pickup Location</label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>
        <div className="pickup-form-group">
          <label>Pickup Date & Time</label>
          <input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </div>
        <div className="pickup-form-buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default PickupFormModal;