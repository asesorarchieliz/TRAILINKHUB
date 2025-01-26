import React from 'react';

function PaymentSection({
  paymentOption,
  setPaymentOption,
  trailpayPoints,
  proofOfPayment,
  setProofOfPayment,
  proofOfPaymentPreview,
  setProofOfPaymentPreview,
  referenceNumber,
  setReferenceNumber,
  pickUpDateTime,
  setPickUpDateTime,
  handleFileChange,
  totalPrice // Add totalPrice as a prop
}) {
  // Calculate the minimum date and time for the pick-up date (current date and time) in local timezone
  const minPickUpDateTime = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Manila', hour12: false }).slice(0, 16);

  return (
    <>
      <div className="add-modal-form-group">
        <label>Payment Options:</label>
        <div>
          <label>
            <input type="radio" value="Gcash" checked={paymentOption === 'Gcash'} onChange={(e) => setPaymentOption(e.target.value)} disabled={totalPrice <= 0} />
            Gcash
          </label>
          <label>
            <input type="radio" value="Paymaya" checked={paymentOption === 'Paymaya'} onChange={(e) => setPaymentOption(e.target.value)} disabled={totalPrice <= 0} />
            Paymaya
          </label>
          <label>
            <input type="radio" value="Gotyme" checked={paymentOption === 'Gotyme'} onChange={(e) => setPaymentOption(e.target.value)} disabled={totalPrice <= 0} />
            Gotyme
          </label>
          <label>
            <input
              type="radio"
              value="Trailpay"
              checked={paymentOption === 'Trailpay'}
              onChange={(e) => setPaymentOption(e.target.value)}
              disabled={trailpayPoints === 0 || totalPrice > trailpayPoints || totalPrice <= 0} // Disable if trailpayPoints is 0, totalPrice is more than trailpayPoints, or totalPrice is less than or equal to 0
            />
            Trailpay
          </label>
        </div>
      </div>
      {paymentOption === 'Trailpay' && (
        <>
          <div className="add-modal-form-group">
            <label>Trailpay Points:</label>
            <span>P{trailpayPoints}</span>
          </div>
          {trailpayPoints <= 0 && (
            <div className="add-modal-form-group">
              <span className="error-text">Not enough points.</span>
            </div>
          )}
        </>
      )}
      {paymentOption !== 'Trailpay' && totalPrice > 0 && (
        <>
          <div className="add-modal-form-group">
            <label>Upload proof of payment:</label>
            <label htmlFor="file-upload" className="custom-file-upload">
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              name="proofOfPayment"
              onChange={(e) => handleFileChange(e, setProofOfPayment, setProofOfPaymentPreview)}
              required
            />
            {proofOfPaymentPreview && (
              <div className="image-preview">
                <img src={proofOfPaymentPreview} alt="Proof of Payment" />
              </div>
            )}
          </div>
          <div className="add-modal-form-group">
            <label>Reference Number:</label>
            <input
              type="text"
              name="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />
          </div>
        </>
      )}
      <div className="add-modal-form-group">
        <label>Pick up Time & Date:</label>
        <input
          type="datetime-local"
          name="pickUpDateTime"
          value={pickUpDateTime}
          onChange={(e) => setPickUpDateTime(e.target.value)}
          min={minPickUpDateTime}
          required
        />
      </div>
    </>
  );
}

export default PaymentSection;