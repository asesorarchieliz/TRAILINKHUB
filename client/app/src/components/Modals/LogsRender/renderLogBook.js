import React from 'react';
import '../styles/LogsModal.css';

const RenderLogBook = ({ admins, name, setName, year, setYear, studentId, setStudentId, program, setProgram, handleSignatureChange, handleSubmit }) => {
  return (
    <div>
      <h2>Log Book</h2>
      <hr />
      <div className="log-book-form">
        <div className="log-book-form-group">
          <label>Name</label>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            <option value="">Select Name</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.name}>{admin.name}</option>
            ))}
          </select>
        </div>
        <div className="log-book-form-group">
          <label>Year Level</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year Level</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="5th Year">5th Year</option>
          </select>
        </div>
        <div className="log-book-form-group">
          <label>Student ID</label>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </div>
        <div className="log-book-form-group">
          <label>Program</label>
          <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} />
        </div>
        <div className="log-book-form-group">
          <label>Signature</label>
          <input type="file" onChange={handleSignatureChange} />
        </div>
        <div className="log-book-form-button-container">
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default RenderLogBook;