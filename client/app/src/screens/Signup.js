import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaIdCard, FaBook, FaBuilding, FaGraduationCap } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Login.css';
import { UserContext } from '../context/UserContext'; // Import the UserContext

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    id_number: '',
    email: '',
    phone: '',
    course: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [passwordStrength, setPasswordStrength] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === 'password') {
      evaluatePasswordStrength(e.target.value);
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = '';
    if (password.length < 6) {
      strength = 'weak';
    } else if (password.length < 10) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.id_number || formData.id_number.length <= 9) newErrors.id_number = 'ID Number must be more than 9 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone || formData.phone.length < 10 || formData.phone.length > 13) {
      newErrors.phone = 'Phone Number is required and must be between 10 and 13 characters';
    }
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const checkUsernameExists = async (username) => {
    try {
      const response = await fetch(`${API_URL}/api/check-username/?username=${username}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      toast.error('Error checking username: ' + error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => toast.error(error));
      return;
    }

    const usernameExists = await checkUsernameExists(formData.username);
    if (usernameExists) {
      toast.error('Username already exists');
      return;
    }

    console.log(formData); // Log formData to verify
    try {
      const response = await fetch(`${API_URL}/api/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('User registered successfully');
        navigate('/login'); // Redirect to login page
      } else {
        const errorData = await response.json();
        toast.error('Error registering user: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      toast.error('Error registering user: ' + error.message);
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
            <h2 className="text-center mb-4">SIGN UP</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    name="name"
                    className="form-control pl-5"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
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
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-control pl-5"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaPhone className="icon" />
                  <input
                    type="text"
                    name="phone"
                    className="form-control pl-5"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaBook className="icon" />
                  <input
                    type="text"
                    name="course"
                    className="form-control pl-5"
                    placeholder="Course"
                    value={formData.course}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaBuilding className="icon" />
                  <select
                    name="department"
                    className="form-control pl-5"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select College</option>
                    <option value="CITC">CITC</option>
                    <option value="CEA">CEA</option>
                    <option value="CSM">CSM</option>
                    <option value="CSTE">CSTE</option>
                    <option value="COT">COT</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaGraduationCap className="icon" />
                  <select
                    name="year"
                    className="form-control pl-5"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Fifth Year">Fifth Year</option>
                  </select>
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
                    style={{
                      borderColor: passwordStrength === 'weak' ? 'red' : passwordStrength === 'medium' ? 'orange' : 'green',
                    }}
                  />
                </div>
                {passwordStrength === 'weak' && <small style={{ color: 'red' }}>Password is too weak</small>}
              </div>
              <div className="form-group">
                <div className="input-icon login-input-icon">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control pl-5"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button type="submit" className="login-button btn btn-success btn-block">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;