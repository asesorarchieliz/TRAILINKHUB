import React from 'react';
import '../styles/LogsModal.css';

const RenderLogs = ({ filteredLogs, searchDate, setSearchDate, searchText, setSearchText, startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div>
      <h2>All Student Logs</h2>
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
          Search Logs:
          <input type="text" placeholder="Enter log details" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </label>
      </div>
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th className="grey-text">Date/Time</th>
              <th className="blue-text">Name</th>
              <th className="blue-text">ID Number</th>
              <th className="green-text">Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index}>
                <td className="grey-text">{new Date(log.date_time).toLocaleString()}</td>
                <td className="blue-text">{log.name}</td>
                <td className="blue-text">{log.id_number}</td>
                <td className="green-text">{log.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderLogs;