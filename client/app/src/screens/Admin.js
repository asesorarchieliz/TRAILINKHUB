import React, { useState, useContext, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Login.css';
import { UserContext } from '../context/UserContext'; // Import the UserContext

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin',
  });

  const { modalColor, setUserEmail, setUserRole, setName } = useContext(UserContext); // Use the UserContext
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.setProperty('--modal-color', modalColor);
  }, [modalColor]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData); // Log formData to verify
    try {
      const response = await fetch(`${API_URL}/api/admin_login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data); // Log data to verify its contents
        setUserEmail(data.email); // Store the user's email in the context
        setUserRole(formData.role); // Store the user's role in the context
        setName(data.name || ''); // Store the user's name in the context, ensure it's a string
        navigate('/dashboard'); // Redirect to admin dashboard upon successful login
      } else {
        const errorData = await response.json();
        toast.error('Error: ' + errorData.message);
      }
    } catch (error) {
      toast.error('Error logging in: ' + error.message);
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
            <h2 className="text-center mb-4">ADMIN LOGIN</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    name="username"
                    className="form-control pl-5"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    name="password"
                    className="form-control pl-5"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button type="submit" className="login-button btn btn-success btn-block">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;