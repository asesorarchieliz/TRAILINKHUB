import React, { useEffect, useState } from 'react';
import TopUpModal from '../TopUpModal';
import '../styles/UserDashboardModal.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cloudinary } from 'cloudinary-core';
import wallet from '../../../assets/wallet.png';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const cloudinary = new Cloudinary({ cloud_name: 'djgtuj9zv', secure: true });

function TrailPayPointsSection({ userEmail }) {
  const [trailPayPoints, setTrailPayPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [userName, setUserName] = useState(''); // Add userName state
  const [userIdNumber, setUserIdNumber] = useState(''); // Add userIdNumber state

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setTrailPayPoints(data.trailpay_points);
          setUserName(data.name); // Set userName
          setUserIdNumber(data.id_number); // Set userIdNumber
        } else {
          console.error('Failed to fetch user info:', data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userEmail]);

  const logChange = async (activity) => {
    const logData = {
      date_time: new Date().toISOString(),
      name: userName,
      id_number: userIdNumber,
      activity,
      role: 'student', // Assuming the role is student for this example
    };
    await fetch(`${API_URL}/api/logs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
  };

  const handleTopUp = () => {
    setIsTopUpModalOpen(true);
  };

  const handleTopUpSubmit = async (formData) => {
    try {
      console.log('FormData being sent:', Object.fromEntries(formData.entries())); // Log the FormData being sent
      if (!formData.get('name')) {
        toast.error('User name is required.');
        return;
      }

      // Upload payment image to Cloudinary
      const paymentImageFile = formData.get('payment_image');
      let paymentImageUrl = '';

      if (paymentImageFile) {
        const formDataForCloudinary = new FormData();
        formDataForCloudinary.append('file', paymentImageFile);
        formDataForCloudinary.append('upload_preset', 'trailink'); // Replace with your upload preset

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/djgtuj9zv/image/upload`, {
          method: 'POST',
          body: formDataForCloudinary,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Cloudinary upload error! status: ${uploadResponse.status}, message: ${errorText}`);
        }

        const data = await uploadResponse.json();
        paymentImageUrl = data.secure_url;
        console.log('Uploaded payment image URL:', paymentImageUrl); // Log the uploaded image URL
        formData.set('payment_image', paymentImageUrl); // Update formData with the Cloudinary URL
      }

      const response = await fetch(`${API_URL}/api/transactions/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Fetch updated user info
        const userInfoResponse = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const userInfoData = await userInfoResponse.json();
        if (userInfoResponse.ok) {
          setTrailPayPoints(userInfoData.trailpay_points);
          logChange('Submitted top-up request');
          toast.success('Top-up request submitted successfully');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to submit top-up request:', errorData);
        toast.error(`Failed to submit top-up request: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to submit top-up request:', error);
      toast.error(`Failed to submit top-up request: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="trailpay-container-wrapper">
        <h3>Available credit points</h3>
        <div className="trailpay-container">
          <p className="trailpay-points">P{trailPayPoints.toFixed(2)}</p>
          <button className="top-up-button btn btn-warning" onClick={handleTopUp}>
            <img src={wallet} alt="Wallet" className="wallet-icon" /> Cash in
          </button>
        </div>
      </div>
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSubmit={handleTopUpSubmit}
        userName={userName} // Pass userName to TopUpModal
      />
    </div>
  );
}

export default TrailPayPointsSection;