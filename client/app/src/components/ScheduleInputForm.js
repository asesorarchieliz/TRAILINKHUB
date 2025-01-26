import React, { useState } from 'react';
import './styles/ScheduleInputForm.css';

const ScheduleInputForm = ({ onConfirm, onCancel, onMakeVacant }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleConfirm = () => {
    if (startTime && endTime) {
      onConfirm(startTime, endTime);
    } else {
      alert('Please enter both start and end times.');
    }
  };

  return (
    <div className="schedule-form-input-form">
      <div className="schedule-form-group">
        <label>Start Time:</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>
      <div className="schedule-form-group">
        <label>End Time:</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <div className="schedule-button-group">
        <button className="schedule-confirm-button" onClick={handleConfirm}>Confirm</button>
        <button className="schedule-make-vacant-button" onClick={onMakeVacant}>Make Vacant</button>
        <button className="schedule-cancel-button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ScheduleInputForm;