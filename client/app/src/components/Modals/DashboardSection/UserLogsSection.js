import React, { useEffect, useState } from 'react';
import './styles/UserLogsSection.css'; // Import the CSS file

const API_URL = process.env.REACT_APP_API_BASE_URL;

function UserLogsSection({ userName, userIdNumber }) {
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/logs/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          const userLogs = data.filter(log => log.name === userName && log.id_number === userIdNumber);
          setUserLogs(userLogs);
        } else {
          console.error('Failed to fetch user logs:', data);
        }
      } catch (error) {
        console.error('Error fetching user logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLogs();
  }, [userName, userIdNumber]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="logs-dashboard-section">
      <h3>User Logs</h3>
      <ul>
        {userLogs.map(log => (
          <li key={log.id}>
            {new Date(log.date_time).toLocaleString()}: {log.activity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserLogsSection;