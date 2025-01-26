import React, { useEffect, useState, useContext } from 'react';
import './styles/ScheduleModal.css'; 
import { UserContext } from '../../context/UserContext'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ScheduleInputForm from '../ScheduleInputForm';
import AddAdminForm from '../AddAdminForm';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function ScheduleModal() {
  const { userEmail, printerLocations } = useContext(UserContext); // Get printerLocations from UserContext
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsResponse = await fetch(`${API_URL}/api/admins/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    fetchAdmins();
  }, [userEmail]);

  const handleBoxClick = (admin, day) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        const handleConfirm = (startTime, endTime) => {
          updateSchedule(admin.id, day, startTime, endTime);
          onClose();
        };

        const handleMakeVacant = () => {
          updateSchedule(admin.id, day, null, null);
          onClose();
        };

        return (
          <div className="custom-ui">
            <h1>Edit Schedule for {day}</h1>
            <ScheduleInputForm onConfirm={handleConfirm} onCancel={onClose} onMakeVacant={handleMakeVacant} />
          </div>
        );
      },
      closeOnClickOutside: false,
    });
  };

  const updateSchedule = async (adminId, day, startTime, endTime) => {
    try {
      const isVacant = startTime === null && endTime === null;
      const response = await fetch(`${API_URL}/api/admins/${adminId}/update_schedule/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day, startTime, endTime, isVacant }),
      });

      if (response.ok) {
        toast.success('Schedule updated successfully!');
        setAdmins(admins.map(admin => {
          if (admin.id === adminId) {
            return {
              ...admin,
              [`${day.toLowerCase()}_start`]: startTime,
              [`${day.toLowerCase()}_end`]: endTime,
              [`${day.toLowerCase()}_is_vacant`]: isVacant,
            };
          }
          return admin;
        }));
      } else {
        toast.error('Failed to update schedule.');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Error updating schedule.');
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  const renderScheduleBox = (admin, day) => {
    const start = admin[`${day.toLowerCase()}_start`];
    const end = admin[`${day.toLowerCase()}_end`];
    const boxClass = start && end ? 'schedule-box occupied' : 'schedule-box vacant';
    return (
      <div key={day} className={boxClass} onClick={() => handleBoxClick(admin, day)}>
        {start && end ? `${formatTime(start)} - ${formatTime(end)}` : 'Vacant'}
      </div>
    );
  };
  
  const handleEditAdmin = (admin) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <AddAdminForm 
          admin={admin} 
          onClose={onClose} 
          setAdmins={setAdmins} 
          printerLocations={printerLocations.map(location => location.toString())} // Ensure printerLocations are strings
        />
      ),
      closeOnClickOutside: false,
    });
  };
  
  const handleAddUser = () => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <AddAdminForm 
          onClose={onClose} 
          setAdmins={setAdmins} 
          printerLocations={printerLocations.map(location => location.toString())} // Ensure printerLocations are strings
        />
      ),
      closeOnClickOutside: false,
    });
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      const response = await fetch(`${API_URL}/api/admins/${adminId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Admin deleted successfully!');
        setAdmins(admins.filter(admin => admin.id !== adminId));
      } else {
        toast.error('Failed to delete admin.');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Error deleting admin.');
    }
  };

  return (
    <div className="schedule-modal">
      <ToastContainer />
      <h2>Shift Schedule</h2>
      <button className="add-user-button" onClick={handleAddUser}>Add User</button>
      <div className="schedule-container">
        <div className="schedule-header">
          <div className="schedule-header-item">Admin</div>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="schedule-header-item">{day}</div>
          ))}
          <div className="schedule-header-item">Actions</div>
        </div>
        {admins.map(admin => (
          <div key={admin.id} className="schedule-row">
            <div className="schedule-admin">{admin.name}</div>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => renderScheduleBox(admin, day))}
            <div className="schedule-actions">
              <button onClick={() => handleEditAdmin(admin)}>Edit</button>
              <button onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleModal;