import React, { useState, useEffect } from 'react';
import './styles/AddRemarkModal.css';
import closeIcon from '../../assets/close.png';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AddCancelledRemarkModal({ isOpen, onClose, onSubmit, orderId }) {
  const [remark, setRemark] = useState('');
  const [otherRemark, setOtherRemark] = useState('');
  const [recommendedPrinter, setRecommendedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`${API_URL}/api/printers/`);
        const data = await response.json();
        setPrinters(data);
      } catch (error) {
        console.error('Error fetching printers:', error);
      }
    };

    fetchPrinters();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRemark = remark === 'Others' ? otherRemark : remark;
    const combinedRemark = recommendedPrinter
      ? `${finalRemark} - Recommended Printer Station: ${recommendedPrinter}`
      : finalRemark;
    onSubmit(orderId, combinedRemark);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Add Cancel Remark</h2>
        <form onSubmit={handleSubmit}>
          <div className="remark-options">
            <label>
              <input
                type="radio"
                value="Reference number doesn't match"
                checked={remark === "Reference number doesn't match"}
                onChange={(e) => setRemark(e.target.value)}
              />
              Reference number doesn't match
            </label>
            <label>
              <input
                type="radio"
                value="The proof of payment is blurred image"
                checked={remark === "The proof of payment is blurred image"}
                onChange={(e) => setRemark(e.target.value)}
              />
              The proof of payment is blurred image
            </label>
            <label>
              <input
                type="radio"
                value="Others"
                checked={remark === "Others"}
                onChange={(e) => setRemark(e.target.value)}
              />
              Others:
            </label>
            <input
              type="text"
              value={otherRemark}
              onChange={(e) => {
                setOtherRemark(e.target.value);
                setRemark('Others');
              }}
              placeholder="Enter your remark here"
              required={remark === "Others"}
            />
          </div>
          <div className="form-actions">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCancelledRemarkModal;