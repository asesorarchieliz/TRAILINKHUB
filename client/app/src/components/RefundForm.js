import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/RefundForm.css';

function RefundForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    gcashNumber: '',
    amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.gcashNumber.length !== 11) {
      toast.error('Gcash number must be 11 digits long.');
      return;
    }
    try {
      await onSubmit(formData);
      toast.success('Refund request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit refund request.');
    }
  };

  return (
    <div className="refund-form">
      <h2>Request a Refund</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Gcash Number:</label>
          <input
            type="text"
            name="gcashNumber"
            value={formData.gcashNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default RefundForm;