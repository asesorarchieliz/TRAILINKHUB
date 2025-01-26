import React from 'react';
import './styles/ImageModal.css'; // Import the CSS file for ImageModal

function ImageModal({ isOpen, onClose, imageSrc }) {
  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay">
      <div className="image-modal-content">
        <img src={imageSrc} alt="Information" className="image-modal-img" />
        <button className="image-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ImageModal;