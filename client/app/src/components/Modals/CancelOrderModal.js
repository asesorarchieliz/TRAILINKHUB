import React, { useState } from 'react';
import './styles/CancelOrderModal.css';
import closeIcon from '../../assets/close.png';

function CancelOrderModal({ isOpen, onClose, onSubmit, orderId }) {
  const [remark, setRemark] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(orderId, remark);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cancel-order-overlay">
      <div className="cancel-order-modal">
        <h2>Cancel Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="cancel-form-group">
            <label htmlFor="remark">Remark:</label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="cancel-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default CancelOrderModal;