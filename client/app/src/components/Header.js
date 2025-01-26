import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/Header.css';
import CreateDiscountVoucherModal from '../components/Modals/CreateDiscountVoucherModal';
import trailinkLogo from '../assets/trailink.png';
import closeIcon from '../assets/close.png';
import dropdownIcon from '../assets/dropdown.png';
import voucherIcon from '../assets/voucher.png';
import accountIcon from '../assets/account.png';
import ordersIcon from '../assets/orders.png';
import historyIcon from '../assets/history.png';
import supplyIcon from '../assets/supply.png';
import emailIcon from '../assets/email.png';
import profileIcon from '../assets/profile.png';
import scheduleIcon from '../assets/schedule.png';
import howToUseImage from '../assets/howtouse.png';
import printingImage from '../assets/printing.png';
import logsIcon from '../assets/logs.png';
import contactIcon from '../assets/contact.png';
import colorIcon from '../assets/color.png';
import userIcon from '../assets/user.png';
import logoImage from '../assets/nameImage.png';
import dashboardIcon from '../assets/dashboard.png';
import moneyIcon from '../assets/money.png';
import { UserContext } from '../context/UserContext';
import LogoImageModal from './Modals/LogoImageModal';
import Modal from './Modal'; // Import the Modal component

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignupPage = location.pathname === '/sign-up';
  const isLoginPage = location.pathname === '/login';
  const isForgetPasswordPage = location.pathname === '/forget-password';
  const isChangePasswordPage = location.pathname === '/change-password';
  const isDashboardPage = location.pathname === '/dashboard';
  const isAdminPage = location.pathname === '/12admin12';
  const { userEmail, name, setUserEmail, setIsAnyModalOpen, userRole, setUserRole, profileImageChanged, setProfileImageChanged, selectedPrinterLocation } = useContext(UserContext);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalContent, setModalContent] = useState(null); // State for modal content
  const [profileImageUrl, setProfileImageUrl] = useState(emailIcon);
  const [isCreateVoucherModalOpen, setIsCreateVoucherModalOpen] = useState(false);
  const [isToastActive, setIsToastActive] = useState(false); // State to track active toast
  const [isClickDisabled, setIsClickDisabled] = useState(false);
  const [isLogoImageModalOpen, setIsLogoImageModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateDiscountVoucher = () => {
    setIsCreateVoucherModalOpen(true);
    setIsAnyModalOpen(true);
  };

  const handleHowToUseClick = () => {
    setShowHowToUse(!showHowToUse);
  };

  const handleCloseClick = () => {
    setShowHowToUse(false);
  };

  const handleDropdownClick = () => {
    console.log('Dropdown clicked');
    setShowDropdown(!showDropdown);
    console.log('showDropdown state:', !showDropdown);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setUserRole(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    if (userRole === 'admin') {
      navigate('/12admin12');
    } else {
      navigate('/login');
    }
  };

  const handleLogoClick = () => {
    setIsLogoImageModalOpen(true);
  };

  const handleLinkClick = (content) => {
    if (isClickDisabled) return; // Prevent clicking if disabled
    setIsClickDisabled(true);
    console.log('Selected printer location:', selectedPrinterLocation); // Debugging statement
    const restrictedAdminModals = ['Accounts', 'Orders', 'History', 'Supply'];
    if (userRole === 'admin' && restrictedAdminModals.includes(content) && (!selectedPrinterLocation || selectedPrinterLocation.trim() === '')) {
      if (!toast.isActive('select-printer-location')) {
        setIsToastActive(true);
        toast.error('Please select a printer location first.', { 
          toastId: 'select-printer-location',
          autoClose: 2000, // Close the toast after 2000 milliseconds (2 seconds)
          onClose: () => {
            setIsToastActive(false);
            setIsClickDisabled(false); // Reset the state when the toast closes
          }
        });
      }
      return; // Return early to prevent opening the modal
    }
  
    setIsClickDisabled(true); // Disable clicking
    setModalContent(content);
    setIsAnyModalOpen(true);
  
    setTimeout(() => {
      setIsClickDisabled(false); // Re-enable clicking after 200ms
    }, 200);
  };

  const closeModal = () => {
    setModalContent(null);
    setIsCreateVoucherModalOpen(false);
    setIsAnyModalOpen(false);
  };

  const fetchProfileImage = async () => {
    try {
      console.log('Fetching profile image for email:', userEmail); // Debugging statement
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
      console.log('Fetched profile image:', data.profileImage); // Debugging statement
      const imageUrl = data.profileImage ? data.profileImage : emailIcon;
      console.log('Profile image URL:', imageUrl);
      setProfileImageUrl(imageUrl);
      setProfileImageChanged(false);
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchProfileImage();
    }
  }, [userEmail, profileImageChanged]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <>
      <header className="header container-fluid">
        <CreateDiscountVoucherModal isOpen={isCreateVoucherModalOpen} onClose={closeModal} />
        <ToastContainer limit={1} />
        <div className="header-left d-flex align-items-center">
          <img src={trailinkLogo} alt="Trailink" className="header-logo img-fluid" onClick={handleLogoClick} />
        </div>
        {!isSignupPage && !isLoginPage && !isAdminPage && !isChangePasswordPage && !isForgetPasswordPage && userEmail && (
          <>
            {!isMobile && (
              <div className="header-center d-flex justify-content-center flex-wrap">
                {userRole === 'admin' ? (
                  <>
                    <span className={`header-link ${modalContent === 'Accounts' ? 'active' : ''}`} onClick={() => handleLinkClick('Accounts')}>
                      <img src={accountIcon} alt="Accounts" className="header-icon img-fluid" />
                      <span className="header-link-text">Accounts</span>
                    </span>
                    <span className={`header-link ${modalContent === 'Printer' ? 'active' : ''}`} onClick={() => handleLinkClick('Printer')}>
                      <img src={printingImage} alt="Printer" className="header-icon img-fluid" />
                      <span className="header-link-text">Printer</span>
                    </span>
                    <span className={`header-link ${modalContent === 'Orders' ? 'active' : ''}`} onClick={() => handleLinkClick('Orders')}>
                      <img src={ordersIcon} alt="Orders" className="header-icon img-fluid" />
                      <span className="header-link-text">Orders</span>
                    </span>
                    <span className={`header-link ${modalContent === 'History' ? 'active' : ''}`} onClick={() => handleLinkClick('History')}>
                      <img src={historyIcon} alt="History" className="header-icon img-fluid" />
                      <span className="header-link-text">History</span>
                    </span>
                    <span className={`header-link ${modalContent === 'Supply' ? 'active' : ''}`} onClick={() => handleLinkClick('Supply')}>
                      <img src={supplyIcon} alt="Supply" className="header-icon img-fluid" />
                      <span className="header-link-text">Supply</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`header-link ${modalContent === 'Profile' ? 'active' : ''}`} onClick={() => handleLinkClick('Profile')}>
                      <img src={accountIcon} alt="Profile" className="header-icon img-fluid" />
                      <span className="header-link-text">Profile</span>
                    </span>
                    <span className={`header-link ${modalContent === 'Orders' ? 'active' : ''}`} onClick={() => handleLinkClick('Orders')}>
                      <img src={ordersIcon} alt="Orders" className="header-icon img-fluid" />
                      <span className="header-link-text">Orders</span>
                    </span>
                    <span className={`header-link ${modalContent === 'Colors' ? 'active' : ''}`} onClick={() => handleLinkClick('Colors')}>
                      <img src={userIcon} alt="Colors" className="header-icon img-fluid" />
                      <span className="header-link-text">User Dashboard</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        )}
        <div className="header-right d-flex align-items-center">
          {(isSignupPage || isLoginPage || isForgetPasswordPage || isChangePasswordPage) && (
            <>
              <span className="header-link-how" onClick={handleHowToUseClick}>How to use?</span>
              <span className="header-divider">|</span>
            </>
          )}
          {!isSignupPage && !isLoginPage && !isAdminPage && !isForgetPasswordPage && !isChangePasswordPage && userEmail ? (
            <div className="header-email-container d-flex align-items-center position-relative" onClick={handleDropdownClick}>
              <img src={profileImageUrl} alt="Email" className="email-icon img-fluid" />
              <span className="header-email">{name}</span>
              <img src={dropdownIcon} alt="Dropdown" className="dropdown-icon" />
              <div className={`dropdown-menu position-absolute ${showDropdown ? 'show' : ''}`} style={{ top: '100%', left: 'auto', right: 0 }}>
                {userRole === 'admin' ? (
                  <>
                    {isMobile && (
                      <>
                        <span className={`dropdown-item ${modalContent === 'Accounts' ? 'active' : ''}`} onClick={() => handleLinkClick('Accounts')}>
                          <img src={accountIcon} alt="Accounts" className="dropdown-content-icon img-fluid" />
                          Accounts
                        </span>
                        <span className={`dropdown-item ${modalContent === 'Printer' ? 'active' : ''}`} onClick={() => handleLinkClick('Printer')}>
                          <img src={printingImage} alt="Printer" className="dropdown-content-icon img-fluid" />
                          Printer
                        </span>
                        <span className={`dropdown-item ${modalContent === 'Orders' ? 'active' : ''}`} onClick={() => handleLinkClick('Orders')}>
                          <img src={ordersIcon} alt="Orders" className="dropdown-content-icon img-fluid" />
                          Orders
                        </span>
                        <span className={`dropdown-item ${modalContent === 'History' ? 'active' : ''}`} onClick={() => handleLinkClick('History')}>
                          <img src={historyIcon} alt="History" className="dropdown-content-icon img-fluid" />
                          History
                        </span>
                        <span className={`dropdown-item ${modalContent === 'Supply' ? 'active' : ''}`} onClick={() => handleLinkClick('Supply')}>
                          <img src={supplyIcon} alt="Supply" className="dropdown-content-icon img-fluid" />
                          Supply
                        </span>
                      </>
                    )}
                    <span className={`dropdown-item ${modalContent === 'Profile' ? 'active' : ''}`} onClick={() => handleLinkClick('Profile')}>
                      <img src={userIcon} alt="Profile" className="dropdown-content-icon img-fluid" />
                      Profile
                    </span>
                    <span className={`dropdown-item ${modalContent === 'Schedule' ? 'active' : ''}`} onClick={() => handleLinkClick('Schedule')}>
                      <img src={scheduleIcon} alt="Schedule" className="dropdown-content-icon img-fluid" />
                      Schedule
                    </span>
                    <span className={`dropdown-item ${modalContent === 'TrailPayAdmin' ? 'active' : ''}`} onClick={() => handleLinkClick('TrailPayAdmin')}>
                      <img src={moneyIcon} alt="TrailPay Admin" className="dropdown-content-icon img-fluid" />
                      TrailPay
                    </span>
                    <span className={`dropdown-item ${modalContent === 'CreateVoucher' ? 'active' : ''}`} onClick={handleCreateDiscountVoucher}>
                      <img src={voucherIcon} alt="Voucher" className="dropdown-content-icon img-fluid" />
                      Create Voucher
                    </span>
                    <span className={`dropdown-item ${modalContent === 'Logs' ? 'active' : ''}`} onClick={() => handleLinkClick('Logs')}>
                      <img src={logsIcon} alt="Logs" className="dropdown-content-icon img-fluid" />
                      Activity Logs
                    </span>
                  </>
                ) : (
                  <>
                    {isMobile && (
                      <>
                        <span className={`dropdown-item ${modalContent === 'Profile' ? 'active' : ''}`} onClick={() => handleLinkClick('Profile')}>
                          <img src={accountIcon} alt="Profile" className="dropdown-content-icon img-fluid" />
                          Profile
                        </span>
                        <span className={`dropdown-item ${modalContent === 'Orders' ? 'active' : ''}`} onClick={() => handleLinkClick('Orders')}>
                          <img src={ordersIcon} alt="Orders" className="dropdown-content-icon img-fluid" />
                          Orders
                        </span>
                        <span className={`dropdown-item ${modalContent === 'Colors' ? 'active' : ''}`} onClick={() => handleLinkClick('Colors')}>
                          <img src={userIcon} alt="Colors" className="dropdown-content-icon img-fluid" />
                          User Dashboard
                        </span>
                      </>
                    )}
                  </>
                )}
                <div className="dropdown-item logout" onClick={handleLogout}>Log Out</div>
              </div>
            </div>
          ) : isAdminPage ? ( null
          ) : isSignupPage || isForgetPasswordPage || isChangePasswordPage ? (
            <Link to="/login" className="header-signup">Login</Link>
          ) : (
            <Link to="/sign-up" className="header-signup">Sign Up</Link>
          )}
        </div>
        {showHowToUse && (
          <div className="how-to-use">
            <img src={closeIcon} alt="Close" className="header-close-icon" onClick={handleCloseClick} />
            <Slider {...sliderSettings}>
              <div>
                <img src={howToUseImage} alt="How to use" className="how-to-use-image img-fluid" />
              </div>
              <div>
                <img src={howToUseImage} alt="How to use" className="how-to-use-image img-fluid" />
              </div>
              <div>
                <img src={howToUseImage} alt="How to use" className="how-to-use-image img-fluid" />
              </div>
              <div>
                <img src={howToUseImage} alt="How to use" className="how-to-use-image img-fluid" />
              </div>
            </Slider>
          </div>
        )}
        <Modal isOpen={!!modalContent} onClose={closeModal} content={modalContent}>
          <h2>{modalContent}</h2>
          {/* Add more content based on the modalContent state */}
        </Modal>
      </header>
      <LogoImageModal isOpen={isLogoImageModalOpen} onClose={() => setIsLogoImageModalOpen(false)} />
    </>
  );
}

export default Header;