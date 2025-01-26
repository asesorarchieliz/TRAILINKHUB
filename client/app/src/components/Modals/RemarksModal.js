import React, { useState } from 'react';
import './styles/RemarksModal.css';

function RemarksModal({ isOpen, onClose, transactionId, onSubmit }) {
  const [remark, setRemark] = useState('');
  const [otherRemark, setOtherRemark] = useState('');

  const handleRemarkChange = (event) => {
    setRemark(event.target.value);
  };

  const handleOtherRemarkChange = (event) => {
    setOtherRemark(event.target.value);
  };

  const handleSubmit = () => {
    const finalRemark = remark === 'Others' ? otherRemark : remark;
    onSubmit(finalRemark); // Pass only the final remark text
  };

  if (!isOpen) return null;

  return (
    <div className="remarks-modal-overlay">
      <div className="remarks-modal">
        <h2>Add Remark</h2>
        <form>
          <div>
            <label>
              <input
                type="radio"
                value="Reference Number doesn't match."
                checked={remark === "Reference Number doesn't match."}
                onChange={handleRemarkChange}
              />
              Reference Number doesn't match.
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="Does not meet the minimum amount."
                checked={remark === "Does not meet the minimum amount."}
                onChange={handleRemarkChange}
              />
              Does not meet the minimum amount.
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="The proof of payment is blurred image."
                checked={remark === "The proof of payment is blurred image."}
                onChange={handleRemarkChange}
              />
              The proof of payment is blurred image.
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="Others"
                checked={remark === 'Others'}
                onChange={handleRemarkChange}
              />
              Others:
              {remark === 'Others' && (
                <input
                  type="text"
                  value={otherRemark}
                  onChange={handleOtherRemarkChange}
                  placeholder="Enter your remark"
                />
              )}
            </label>
          </div>
          <button type="button" onClick={handleSubmit}>Submit</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default RemarksModal;