import React from 'react';
import '../styles/LogsModal.css';

const RenderAdminLogs = ({ filteredAdmins, adminLogs, searchDate, setSearchDate, searchText, setSearchText, startDate, setStartDate, endDate, setEndDate }) => {
  const filteredLogs = adminLogs.filter(log => {
    const logDate = new Date(log.date_time).toISOString().split('T')[0];
    const matchesDate = !searchDate || logDate === searchDate;
    const matchesText = !searchText || log.activity.toLowerCase().includes(searchText.toLowerCase());
    const matchesStartDate = !startDate || new Date(log.date_time) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(log.date_time) <= new Date(endDate);
    return matchesDate && matchesText && matchesStartDate && matchesEndDate;
  });

  return (
    <div>
      <h2>All Admin Logs</h2>
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
              <th className="grey-text">Name</th>
              <th className="blue-text">Email</th>
              <th className="blue-text">ID Number</th>
              <th className="blue-text">Role</th>
              <th className="green-text">Activity</th>
              <th className="green-text">Date & Time</th>
              <th className="green-text">Signature</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index}>
                <td className="grey-text">{log.name}</td>
                <td className="blue-text">{filteredAdmins.find(admin => admin.name === log.name)?.email}</td>
                <td className="blue-text">{log.id_number}</td>
                <td className="blue-text">{filteredAdmins.find(admin => admin.name === log.name)?.role}</td>
                <td className="green-text">{log.activity}</td>
                <td className="green-text">{new Date(log.date_time).toLocaleString()}</td>
                <td className="green-text">
                  {log.signature && <img src={`${log.signature}`} alt="Signature" style={{ width: '100px', height: 'auto' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderAdminLogs;