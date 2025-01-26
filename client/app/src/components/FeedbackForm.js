import React, { useState } from 'react';
import './styles/FeedbackForm.css'; // Import the CSS file

function FeedbackForm({ onSubmit, onCancel }) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h2>Feedback</h2>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Please provide your feedback here..."
        required
      />
      <div>
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default FeedbackForm;