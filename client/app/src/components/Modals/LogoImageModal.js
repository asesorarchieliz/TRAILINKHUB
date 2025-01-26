import React from 'react';
import './styles/LogoImageModal.css';
import closeIcon from '../../assets/close.png';
import logoImage from '../../assets/nameImage.png';

function LogoImageModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="logo-image-modal-overlay">
      <div className="logo-image-modal">
        <img src={closeIcon} alt="Close" className="logo-close-icon" onClick={onClose} />
        <img src={logoImage} alt="Name" className="logo-image" />
      </div>
    </div>
  );
}

export default LogoImageModal;