import React, { useState } from 'react';
import './styles/CustomModal.css';

const CustomCancelOrderModal = ({ isOpen, onSubmit, onCancel }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback(''); // Clear feedback after submission
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <p>What are the reasons you want to cancel your order?</p>
        <p>We would like to know why before you submit.</p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          className="feedback-textarea"
        />
        <div className="button-group">
          <button className="submit-button" onClick={handleSubmit}>Submit</button>
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CustomCancelOrderModal;