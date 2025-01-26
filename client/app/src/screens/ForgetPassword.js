import React, { useState } from 'react';
import { FaEnvelope, FaIdCard, FaLock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Login.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function ForgetPassword() {
  const [formData, setFormData] = useState({
    email: '',
    id_number: '',
    new_password: '',
    confirm_password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.email) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.id_number) {
      toast.error('ID number is required');
      return false;
    }
    if (!formData.new_password) {
      toast.error('New password is required');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_URL}/api/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Password has been reset successfully.');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after a delay
        }, 3000);
      } else {
        const errorData = await response.json();
        toast.error('Error resetting password: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      toast.error('Error resetting password: ' + error.message);
    }
  };

  return (
    <div className="login-container container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#dbf8ff' }}>
      <ToastContainer />
      <div className="row w-100">
        <div className="login-image col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
          <div className="login-image-box">
            {/* Placeholder for the image */}
          </div>
        </div>
        <div className="login-form-container col-lg-6 col-md-8 col-sm-10 d-flex justify-content-center align-items-center">
          <div className="login-form card p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 className="text-center mb-4">FORGET PASSWORD</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-control pl-5"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaIdCard className="icon" />
                  <input
                    type="text"
                    name="id_number"
                    className="form-control pl-5"
                    placeholder="ID Number"
                    value={formData.id_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    name="new_password"
                    className="form-control pl-5"
                    placeholder="New Password"
                    value={formData.new_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control pl-5"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button type="submit" className="login-button btn btn-success btn-block">Reset Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;