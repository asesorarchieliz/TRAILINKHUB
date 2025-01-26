import React from 'react';
import '../styles/LogsModal.css';

const RenderAvailHistory = ({ sortedUsers = [], searchDate, setSearchDate, searchText, setSearchText, handleReavail, startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div>
      <h2>Avail History</h2>
      <hr />
      <div className="logs-search">
        <label>
          Search Date:
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label>
          Search Users:
          <input type="text" placeholder="Enter user details" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </label>
      </div>
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th className="green-text">Queue No.</th>
              <th className="grey-text">Name</th>
              <th className="blue-text">ID Number</th>
              <th className="blue-text">Date/Time</th>
              <th className="green-text">Avail Status</th>
              <th className="green-text">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={index}>
                <td className="green-text">{index + 1}</td>
                <td className="grey-text">{user.name}</td>
                <td className="blue-text">{user.id_number}</td>
                <td className="blue-text">{user.last_free_printing_availment ? new Date(user.last_free_printing_availment).toLocaleString() : 'N/A'}</td>
                <td className="green-text">{user.avail_status}</td>
                <td className="green-text">
                  <button onClick={() => handleReavail(user.id)}>Reavail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderAvailHistory;