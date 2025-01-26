import React, { useEffect, useState, useContext } from 'react';
import './styles/ProfileModal.css'; // Make sure to create this CSS file for styling
import { UserContext } from '../../context/UserContext'; // Import the UserContext
import email from '../../assets/email.png'; // Import the email icon
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cloudinary } from 'cloudinary-core';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const cloudinary = new Cloudinary({ cloud_name: 'djgtuj9zv', secure: true });

function ProfileModal() {
  const { userEmail, userRole, id_number, name, setName, setProfileImageChanged } = useContext(UserContext); // Get the logged-in user's email and role from context
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    id_number: '', // Update property name to match backend
    email: '',
    phone: '',
    course: '',
    department: '',
    year: '',
    gender: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const fetchUserInfo = async () => {
    try {
      console.log('Fetching user information for email:', userEmail); // Debugging statement
      const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseText = await response.text(); // Get response text
      console.log('Response text:', responseText); // Log response text
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = JSON.parse(responseText); // Parse the response text as JSON
      console.log('Fetched user information:', data); // Debugging statement
      setUserInfo(data);
      setFormData({
        username: data.username || '',
        name: data.name || '',
        id_number: data.id_number || '', // Update property name to match backend
        email: data.email || '',
        phone: data.phone || '',
        course: data.course || '',
        department: data.department || '',
        year: data.year || '',
        gender: data.gender || '',
      });
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserInfo();
    }
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'trailink'); // Replace with your upload preset

    const response = await fetch(`https://api.cloudinary.com/v1_1/djgtuj9zv/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Image uploaded successfully:', data.secure_url); // Log the successful upload
    return data.secure_url;
  };

  const updateMessages = async (oldName, newName) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/update_names/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldName, newName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Messages updated successfully!');
    } catch (error) {
      console.error('Error updating messages:', error);
    }
  };

  const handleSave = async () => {
    // Check for empty values
    for (const key in formData) {
      if (formData[key].trim() === '' && key !== 'id_number' && key !== 'course' && key !== 'department' && key !== 'year') {
        toast.error(`The ${key} field cannot be empty.`, { autoClose: 100 });
        return;
      }
    }
  
    try {
      console.log('Saving user information:', formData); // Debugging statement
      const formDataToSend = { ...formData };
      if (profileImage) {
        const imageUrl = await uploadImageToCloudinary(profileImage);
        formDataToSend.profileImage = imageUrl;
        console.log('Image URL added to formData:', imageUrl); // Log the image URL
      }
      console.log('FormData being sent:', formDataToSend); // Log the FormData being sent
      const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });
      console.log('Response status:', response.status); // Debugging statement
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      setName(formData.name); // Update the name in context
      console.log('Profile updated successfully!');
      setProfileImageChanged(true); // Set profile image changed to trigger re-fetch
      fetchUserInfo(); // Re-fetch user data after successful save
      setProfileImagePreview(null); // Clear the preview after saving
  
      // Update messages with the new name
      if (name !== formData.name) {
        await updateMessages(name, formData.name);
      }
  
      // Log the profile update activity
      const logData = {
        date_time: new Date().toISOString(),
        name: formData.name,
        id_number: formData.id_number,
        activity: 'Updated profile',
        role: userRole, // Include the user's role
      };
      await fetch(`${API_URL}/api/logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.error('Error saving user information:', error);
      toast.error(`Failed to update profile: ${error.message}`, { autoClose: 100 });
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const profileImageUrl = profileImagePreview || (userInfo.profileImage ? userInfo.profileImage : email);

  return (
    <div className="profile-modal">
      <ToastContainer />
      <div className="profile-left">
        <h2>My Profile</h2>
        <p>Manage and protect your account</p>
        <hr />
        <form>
          <div className="profile-form-group">
            <label>Username:</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="profile-form-group">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="profile-form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} readOnly />
          </div>
          <div className="profile-form-group">
            <label>Phone No.:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          {userRole === 'student' && (
            <>
              <div className="profile-form-group">
                <label>ID Number:</label>
                <input type="text" name="id_number" value={formData.id_number} readOnly /> {/* Update name attribute and set readOnly */}
              </div>
              <div className="profile-form-group">
                <label>Course:</label>
                <input type="text" name="course" value={formData.course} onChange={handleChange} />
              </div>
              <div className="profile-form-group">
                <label>Department:</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="profile-form-group">
                <label>Year:</label>
                <input type="text" name="year" value={formData.year} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="profile-form-group">
            <label>Gender:</label>
            <div className="gender-options">
              <label>
                <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} />
                Male
              </label>
              <label>
                <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} />
                Female
              </label>
              <label>
                <input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} />
                Other
              </label>
            </div>
          </div>
          <button type="button" onClick={handleSave}>Save</button>
        </form>
      </div>
      <div className="vertical-line"></div>
      <div className="profile-right">
        <div className="profile-image">
          <img src={profileImageUrl} alt="Profile" />
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="profileImageInput" />
        <label htmlFor="profileImageInput" className="custom-file-upload">
          Select Image
        </label>
        <p>File Size: 2MB</p>
        <p>File Extension: .jpg, .png</p>
      </div>
    </div>
  );
}

export default ProfileModal;