import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Login.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function ChangePassword() {
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
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
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Both password fields are required');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_URL}/api/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          newPassword: formData.newPassword,
        }),
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
            <h2 className="text-center mb-4">RESET PASSWORD</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="login-button btn btn-success btn-block">Reset Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;