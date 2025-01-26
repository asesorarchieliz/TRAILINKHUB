import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import './styles/UserDashboardModal.css';
import { UserContext } from '../../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import closeIcon from '../../assets/close.png';
import TrailPayPointsSection from './DashboardSection/TrailPayPointsSection';
import DiscountVouchersSection from './DashboardSection/DiscountVouchersSection';
import UserLogsSection from './DashboardSection/UserLogsSection';
import TransactionsSection from './DashboardSection/TransactionsSection';
import ColorPickerSection from './DashboardSection/ColorPickerSection';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function UserDashboardModal({ onClose }) {
  const { userEmail, user, setModalColor, setSecondaryModalColor, setFontColor } = useContext(UserContext);
  const [userName, setUserName] = useState('');
  const [id, setId] = useState('');
  const [userIdNumber, setUserIdNumber] = useState('');
  const [selectedSection, setSelectedSection] = useState('TrailPayPoints');
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(user.modalColor);
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState(user.secondaryModalColor);
  const [selectedFontColor, setSelectedFontColor] = useState(user.fontColor || '#000000');

  const prevUserEmail = useRef(userEmail);
  const prevSetModalColor = useRef(setModalColor);
  const prevSetSecondaryModalColor = useRef(setSecondaryModalColor);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log('Fetching user info...');
        const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const responseText = await response.text(); // Get response text
        console.log('Response text:', responseText); // Log response text

        if (response.ok) {
          const data = JSON.parse(responseText); // Parse the response text as JSON
          setUserName(data.name);
          setUserIdNumber(data.id_number);
          setId(data.id);
          setModalColor(data.modalColor || '#ffffff');
          setSelectedColor(data.modalColor || '#ffffff');
          setSecondaryModalColor(data.secondaryModalColor || '#000000');
          setSelectedSecondaryColor(data.secondaryModalColor || '#000000');
          setFontColor(data.fontColor || '#000000');
          setSelectedFontColor(data.fontColor || '#000000');
        } else {
          console.error('Failed to fetch user info:', responseText);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialMount.current) {
      fetchUserInfo();
      isInitialMount.current = false;
    } else if (
      userEmail !== prevUserEmail.current ||
      setModalColor !== prevSetModalColor.current ||
      setSecondaryModalColor !== prevSetSecondaryModalColor.current
    ) {
      fetchUserInfo();
      prevUserEmail.current = userEmail;
      prevSetModalColor.current = setModalColor;
      prevSetSecondaryModalColor.current = setSecondaryModalColor;
    }
  }, [userEmail, setModalColor, setSecondaryModalColor, setFontColor]);

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

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.error('onClose is not a function');
    }
  };

  const handleColorChange = useCallback((color) => {
    if (color !== selectedColor) {
      setSelectedColor(color);
      logChange('Changed primary color');
    }
  }, [selectedColor]);

  const handleSecondaryColorChange = useCallback((color) => {
    if (color !== selectedSecondaryColor) {
      setSelectedSecondaryColor(color);
      logChange('Changed secondary color');
    }
  }, [selectedSecondaryColor]);

  const handleFontColorChange = useCallback((color) => {
    if (color !== selectedFontColor) {
      setSelectedFontColor(color);
      logChange('Changed font color');
    }
  }, [selectedFontColor]);

  const handleSubmitColorChange = useCallback(async (color) => {
    setModalColor(color);
    try {
      const response = await fetch(`${API_URL}/api/users/update-color/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, modalColor: color }),
      });
      const data = await response.json();
      logChange('Submitted primary color change');
    } catch (error) {
      toast.error(`Error updating color: ${error.message}`);
    }
  }, [userEmail, setModalColor]);

  const handleSubmitSecondaryColorChange = useCallback(async (color) => {
    setSecondaryModalColor(color);
    try {
      const response = await fetch(`${API_URL}/api/users/update-secondary-color/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, secondaryModalColor: color }),
      });
      const data = await response.json();
      logChange('Submitted secondary color change');
    } catch (error) {
      toast.error(`Error updating secondary color: ${error.message}`);
    }
  }, [userEmail, setSecondaryModalColor]);

  const handleSubmitFontColorChange = useCallback(async (color) => {
    setFontColor(color);
    try {
      const response = await fetch(`${API_URL}/api/users/update-font-color/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, fontColor: color }),
      });
      const data = await response.json();
      logChange('Submitted font color change');
    } catch (error) {
      toast.error(`Error updating font color: ${error.message}`);
    }
  }, [userEmail, setFontColor]);

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    logChange(`Changed section to ${section}`);
  };

  const renderSection = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    switch (selectedSection) {
      case 'TrailPayPoints':
        return <TrailPayPointsSection userEmail={userEmail} logChange={logChange} />;
      case 'DiscountVouchers':
        return <DiscountVouchersSection userId={id} />;
      case 'UserLogs':
        return <UserLogsSection userName={userName} userIdNumber={userIdNumber} />;
      case 'Transactions':
        return <TransactionsSection userName={userName} />;
      case 'ColorPicker':
        return (
          <ColorPickerSection
            onColorChange={handleColorChange}
            onSubmitColorChange={handleSubmitColorChange}
            onSecondaryColorChange={handleSecondaryColorChange}
            onSubmitSecondaryColorChange={handleSubmitSecondaryColorChange}
            onFontColorChange={handleFontColorChange}
            onSubmitFontColorChange={handleSubmitFontColorChange}
            initialPrimaryColor={selectedColor}
            initialSecondaryColor={selectedSecondaryColor}
            initialFontColor={selectedFontColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-dashboard-modal" style={{ backgroundColor: user.secondaryModalColor, color: user.fontColor }}>
      <button className="modal-close" onClick={handleClose}>
        <img src={closeIcon} alt="Close" />
      </button>
      <h2>User Dashboard</h2>
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <button onClick={() => handleSectionChange('TrailPayPoints')}>TrailPay Points</button>
          <button onClick={() => handleSectionChange('Transactions')}>Transactions</button>
          <button onClick={() => handleSectionChange('DiscountVouchers')}>Discount Vouchers</button>
          <button onClick={() => handleSectionChange('UserLogs')}>User Logs</button>
          <button onClick={() => handleSectionChange('ColorPicker')}>Change Color</button>
        </div>
        <div className="dashboard-main">
          {renderSection()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default UserDashboardModal;