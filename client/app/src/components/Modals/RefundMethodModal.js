import React, { useState } from 'react';
import Modal from '../Modal';
import './styles/RefundMethodModal.css'; // Import the CSS file
import { toast } from 'react-toastify'; // Import toast for error messages

function RefundMethodModal({ isOpen, onClose, onSubmit, selectedOrderStatus }) {
  const [refundMethod, setRefundMethod] = useState('');
  const [otherMethod, setOtherMethod] = useState('');

  const handleRefundMethodChange = (e) => {
    setRefundMethod(e.target.value);
  };

  const handleOtherMethodChange = (e) => {
    setOtherMethod(e.target.value);
  };

  const handleSubmit = () => {
    if (!refundMethod) {
      toast.error('Please select a refund method');
      return;
    }
    const method = refundMethod === 'Other' ? otherMethod : refundMethod;
    if (refundMethod === 'Other' && !otherMethod) {
      toast.error('Please specify the other refund method');
      return;
    }
    onSubmit(method);
    onClose();
  };

  // Filter out TrailPay if the status is Cancelled
  const refundMethods = [
    { value: 'F2F', label: 'Face to Face' },
    { value: 'TrailPay', label: 'TrailPay' },
    { value: 'GCash', label: 'GCash' },
    { value: 'Other', label: 'Other Online Method' },
  ];

  const filteredRefundMethods = selectedOrderStatus === 'Cancelled'
    ? refundMethods.filter(method => method.value !== 'TrailPay')
    : refundMethods;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="refund-method-modal">
        <h2>Select Refund Method</h2>
        <div className="refund-method-options">
          {filteredRefundMethods.map(method => (
            <label key={method.value}>
              <input
                type="radio"
                value={method.value}
                checked={refundMethod === method.value}
                onChange={handleRefundMethodChange}
              />
              {method.label}
            </label>
          ))}
          {refundMethod === 'Other' && (
            <input
              type="text"
              placeholder="Specify other method"
              value={otherMethod}
              onChange={handleOtherMethodChange}
            />
          )}
        </div>
        <div className="refund-method-buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button type="button" className="refund-back-button" onClick={onClose}>Back</button>
        </div>
      </div>
    </Modal>
  );
}

export default RefundMethodModal;