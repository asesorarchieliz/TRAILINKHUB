import React, { useEffect, useState, useContext } from 'react';
import './styles/AvailModal.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGraduationCap, FaBuilding, FaUser, FaEnvelope, FaPhone, FaBook } from 'react-icons/fa'; // Import the icons
import { UserContext } from '../../context/UserContext';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AvailModal({ setContent, closeParentModal }) {
  const { userEmail } = useContext(UserContext); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    department: '',
    year: '',
  });

  const [isAvailed, setIsAvailed] = useState(false);
  const [availCount, setAvailCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const fetchLoggedUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const userData = await response.json();
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        course: userData.course || '',
        department: userData.department || '',
        year: userData.year || '',
      });
  
      setAvailCount(userData.avail_count || 0);
  
      // Set isAvailed based on avail_status
      if (userData.avail_status === 'Not availed' || userData.avail_status === 'Not Availed') {
        setIsAvailed(false);
      } else {
        setIsAvailed(true);
      }

      // Fetch all users and check avail_status
      const allUsersResponse = await fetch(`${API_URL}/api/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!allUsersResponse.ok) {
        throw new Error(`HTTP error! status: ${allUsersResponse.status}`);
      }

      const allUsersData = await allUsersResponse.json();
      const availedUsers = allUsersData.filter(user => user.avail_status === 'Availed');
      const availedUsersCount = availedUsers.length;
      if (availedUsersCount >= 15) {
        setIsLimitReached(true);
      }

      // Log the students who have availed
      console.log('Students who have availed:', availedUsers);
    } catch (error) {
      console.error('Error fetching logged user data:', error);
    }
  };
  
  const updateUserFreePrinting = async (email) => {
    try {
      const today = new Date().toISOString();
      const updateResponse = await fetch(`${API_URL}/api/users/email/?email=${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFreePrintingAvailed: true,
          avail_count: availCount + 1,
          avail_status: 'Availing',
          last_free_printing_availment: today,
        }),
      });
  
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }
  
      console.log('User information updated successfully.');
      return true;
    } catch (error) {
      console.error('Error updating user information:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchLoggedUserData();
  }, [userEmail]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    const { name, email, phone, course, department, year } = formData;
    if (!name || !email || !phone || !course || !department || !year) {
      toast.error('Please fill in all the fields.');
      return;
    }

    // Check if the user has not availed yet
    const userResponse = await fetch(`${API_URL}/api/users/email/?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      toast.error('Failed to fetch user information.');
      return;
    }

    const userData = await userResponse.json();
    if (userData.avail_status !== 'Not availed' && userData.avail_status !== 'Not Availed') {
      toast.error('You have already availed or are currently availing.');
      return;
    }

    console.log('Is limit reached:', isLimitReached);
    if (isLimitReached) {
      toast.error('The limit of 15 availed vouchers has been reached.');
      return;
    }

    // Update the user's isFreePrintingAvailed field to true, increment avail_count, and set avail_status to "Availing"
    const updateSuccess = await updateUserFreePrinting(email);
    if (!updateSuccess) {
      toast.error('Failed to update user information.');
      return;
    }

    // Refetch the user data to update the button state
    await fetchLoggedUserData();

    // Handle form submission logic here
    console.log(formData);
    toast.success('The admin team will work on approving and sending a voucher soon.');
  };

  return (
    <div className="avail-modal">
      <ToastContainer />
      <h2>Avail Free Printing</h2>
      <p>Please input all the details needed to avail.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-icon">
            <FaUser className="icon" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon">
            <FaEnvelope className="icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon">
            <FaPhone className="icon" />
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon">
            <FaBook className="icon" />
            <input
              type="text"
              id="course"
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon">
            <FaBuilding className="icon" />
            <input
              type="text"
              id="department"
              name="College"
              placeholder="College"
              value={formData.department}
              readOnly
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-icon">
            <FaGraduationCap className="icon" />
            <select name="year" value={formData.year} onChange={handleChange} required>
              <option value="">Select Year</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
              <option value="Fifth Year">Fifth Year</option>
            </select>
          </div>
        </div>
        <button type="submit" className="avail-submit-button" disabled={isAvailed || isLimitReached} style={{ backgroundColor: isAvailed || isLimitReached ? 'grey' : '' }}>
          {isAvailed ? 'Already Availed' : isLimitReached ? 'Limit Reached' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default AvailModal;