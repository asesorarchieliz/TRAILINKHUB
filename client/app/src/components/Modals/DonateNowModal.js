import React, { useState } from 'react';
import './styles/DonateNowModal.css'; // Create this CSS file for styling
import closeIcon from '../../assets/close.png'; // Assuming you have a close icon
import donate1 from '../../assets/donate1.jpg';
import donate2 from '../../assets/donate2.jpg';
import donate3 from '../../assets/donate3.jpg';
import donate4 from '../../assets/donate4.jpg';

const images = [donate1, donate2, donate3, donate4];

function DonateNowModal({ isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="donate-now-modal">
      <div className="donate-modal-content">
        <button className="donate-modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Donate Now</h2>
        <div className="donate-image-container">
          <button className="arrow left-arrow" onClick={handlePrev}>&#9664;</button>
          <img src={images[currentImageIndex]} alt={`Donate ${currentImageIndex + 1}`} className="donate-image" />
          <button className="arrow right-arrow" onClick={handleNext}>&#9654;</button>
        </div>
      </div>
    </div>
  );
}

export default DonateNowModal;