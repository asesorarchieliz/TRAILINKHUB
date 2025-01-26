import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './styles/AddAdminForm.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const AddAdminForm = ({ onClose, setAdmins, admin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setUsername(admin.username);
      setEmail(admin.email);
      setPhone(admin.phone);
      setGender(admin.gender);
      setDepartment(admin.department);
    }
  }, [admin]);

  useEffect(() => {
    const fetchPrinterLocations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/printers/`);
        const data = await response.json();
        const uniqueLocations = [...new Set(data.map(printer => printer.location).filter(location => location))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching printer locations:', error);
      }
    };

    fetchPrinterLocations();
  }, []);

  const handleConfirm = async () => {
    try {
      const url = admin ? `${API_URL}/api/admins/${admin.id}/update/` : `${API_URL}/api/admin_signup/`;
      const method = admin ? 'PUT' : 'POST';
      const body = admin ? { name, username, email, phone, gender, department } : { name, username, email, password, phone, gender, department };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const newAdmin = await response.json();
        if (admin) {
          setAdmins(prevAdmins => prevAdmins.map(a => (a.id === admin.id ? newAdmin : a)));
          toast.success('Admin updated successfully!');
        } else {
          setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
          toast.success('Admin added successfully!');
        }
        onClose();
      } else {
        toast.error(`Failed to ${admin ? 'update' : 'add'} admin.`);
      }
    } catch (error) {
      console.error(`Error ${admin ? 'updating' : 'adding'} admin:`, error);
      toast.error(`Error ${admin ? 'updating' : 'adding'} admin.`);
    }
  };

  return (
    <div className="custom-ui add-admin-form">
      <h1>{admin ? 'Edit Admin' : 'Add Admin'}</h1>
      <div className="form-group add-admin-form-group">
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group add-admin-form-group">
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="form-group add-admin-form-group">
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {!admin && (
        <div className="form-group add-admin-form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      )}
      <div className="form-group add-admin-form-group">
        <label>Phone:</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-group add-admin-form-group">
        <label>Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Others">Others</option>
        </select>
      </div>
      <div className="form-group add-admin-form-group">
        <label>Department:</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Select Department</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      <div className="button-group add-admin-button-group">
        <button className="add-admin-confirm-button" onClick={handleConfirm}>{admin ? 'Edit Admin' : 'Add Admin'}</button>
        <button className="add-admin-cancel-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddAdminForm;