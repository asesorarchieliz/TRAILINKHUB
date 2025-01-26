import React, { useState, useContext } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Login.css';
import { UserContext } from '../context/UserContext'; // Import the UserContext

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { setUserEmail, setUserRole, setIsFreePrintingAvailed, setUser, setIdNumber, setName } = useContext(UserContext); // Use the UserContext
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedFormData = {
      username: formData.username.trim(),
      password: formData.password.trim(),
    };
    console.log(trimmedFormData); // Log formData to verify
    try {
      const response = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedFormData),
      });
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email); // Store the user's email in the context
        setUserRole('student'); // Default to student role
        setIsFreePrintingAvailed(false); // Set free printing availment to false
        setIdNumber(data.id_number);
        setName(data.name);
  
        // Fetch user data to check active status
        const userResponse = await fetch(`${API_URL}/api/users/email/?email=${data.email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const userData = await userResponse.json();
        console.log('Fetched user data:', userData); // Log userData to verify
  
        if (userData.active === false) {
          toast.error('Your account is blocked', { autoClose: 500 });
        } else {
          const userId = userData.id || (Array.isArray(userData) && userData[0]?.id);
          if (userId) {
            // Update last_login field
            await fetch(`${API_URL}/api/users/${userId}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ last_login: new Date().toISOString() }),
            });
  
            // Set the user data in the context
            setUser(userData);
  
            navigate('/dashboard'); // Redirect to dashboard upon successful login
          } else {
            console.error('User ID is undefined:', userData);
            toast.error('Error: User ID is undefined', { autoClose: 500 });
          }
        }
      } else {
        const errorData = await response.json();
        toast.error('Error: ' + errorData.message, { autoClose: 500 });
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleForgetPassword = () => {
    navigate('/forget-password'); // Navigate to Forget Password page
  };

  return (
    <div className="login-container container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#dbf8ff' }}>
      <ToastContainer limit={1} autoClose={500} />
      <div className="row w-100">
        <div className="login-image col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
          <div className="login-image-box">
            {/* Placeholder for the image */}
          </div>
        </div>
        <div className="login-form-container col-lg-6 col-md-8 col-sm-10 d-flex justify-content-center align-items-center">
          <div className="login-form card p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 className="text-center mb-4">LOGIN</h2>
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
              <div className="form-group">
                <button type="button" className="forgot-password btn btn-link p-0 text-danger" onClick={handleForgetPassword}>Forget Password?</button>
              </div>
              <button type="submit" className="login-button btn btn-success btn-block">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;