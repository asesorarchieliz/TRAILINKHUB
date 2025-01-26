import React, { useState } from 'react';
import './styles/ChangeReferenceImageModal.css';
import closeIcon from '../../assets/close.png';

function ChangePaymentImageModal({ isOpen, onClose, onSubmit, orderId }) {
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file); // Log the file details to the console
    setReferenceImage(file);
    setReferenceImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(orderId, referenceImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="reference-modal-overlay">
      <div className="reference-modal-content">
        <button className="reference-modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Change Payment Image</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {referenceImagePreview && (
            <div className="image-preview">
              <img src={referenceImagePreview} alt="Reference Preview" />
            </div>
          )}
          <div className="reference-form-actions">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePaymentImageModal;