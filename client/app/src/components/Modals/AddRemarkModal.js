import React, { useState, useEffect } from 'react';
import './styles/AddRemarkModal.css';
import closeIcon from '../../assets/close.png';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AddRemarkModal({ isOpen, onClose, onSubmit, orderId }) {
  const [remark, setRemark] = useState('');
  const [otherRemark, setOtherRemark] = useState('');
  const [recommendedPrinter, setRecommendedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [newTotalPrice, setNewTotalPrice] = useState('');

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
    let finalRemark = remark;
    if (remark === 'Others') {
      finalRemark = otherRemark;
    } else if (remark === 'Change total price') {
      finalRemark = `Changed total price to ${newTotalPrice}`;
    }
  
    let combinedRemark = finalRemark;
    if (recommendedPrinter) {
      combinedRemark = finalRemark 
        ? `${finalRemark} - Recommended Printer Station: ${recommendedPrinter}` 
        : `Recommended Printer Station: ${recommendedPrinter}`;
    }
  
    onSubmit(orderId, combinedRemark);
    onClose();
  };
  
  if (!isOpen) return null;

  // Create a set to keep track of unique locations
  const uniqueLocations = new Set(printers.map(printer => printer.location));

  return (
    <div className="modal-overlay">
      <div className="add-remark-modal-content">
        <button className="modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
        <h2>Add Remark</h2>
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
                value="Change total price"
                checked={remark === "Change total price"}
                onChange={(e) => setRemark(e.target.value)}
              />
              Change total price:
              {remark === "Change total price" && (
                <input
                  type="number"
                  value={newTotalPrice}
                  onChange={(e) => setNewTotalPrice(e.target.value)}
                  placeholder="Enter new total price"
                  className="form-control"
                />
              )}
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
            {remark === "Others" && (
              <input
                type="text"
                value={otherRemark}
                onChange={(e) => setOtherRemark(e.target.value)}
                placeholder="Enter your remark here"
                required
                className="form-control"
              />
            )}
          </div>
          <div className="recommended-printer">
            <h3>Recommended Printer Station:</h3>
            {[...uniqueLocations].map((location, index) => (
              <label key={index}>
                <input
                  type="radio"
                  value={location}
                  checked={recommendedPrinter === location}
                  onChange={(e) => setRecommendedPrinter(e.target.value)}
                />
                {location}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRemarkModal;