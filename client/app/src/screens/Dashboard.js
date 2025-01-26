import React, { useState, useContext, useEffect } from 'react';
import '../styles/Dashboard.css';
import { UserContext } from '../context/UserContext';
import Modal from '../components/Modal';
import AvailModal from '../components/Modals/AvailModal';
import AddOrderModal from '../components/Modals/AddOrderModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import trailinkLogo from '../assets/trailink.png';
import chat from '../assets/chat.png';
import contactIcon from '../assets/contact.png';
import ustpImage from '../assets/USTP-building.jpg';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const [modalContent, setModalContent] = useState(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { userEmail, name, userRole, isAnyModalOpen, setIsAnyModalOpen, selectedPrinterLocation, setSelectedPrinterLocation, modalColor, secondaryModalColor, printerLocations, setPrinterLocations, department } = useContext(UserContext);

  const fetchPrinterLocations = async (retryCount = 3) => {
    try {
      const response = await fetch(`${API_URL}/api/printers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const filteredPrinters = data.filter(printer => printer.location === department);
        setPrinterLocations(filteredPrinters); // Set filtered printers
        if (filteredPrinters.length > 0) {
          setSelectedPrinterLocation(filteredPrinters[0].location); // Set the first printer location as the selected printer location
        }
      } else {
        console.error('Failed to fetch printer locations');
        if (retryCount > 0) {
          setTimeout(() => fetchPrinterLocations(retryCount - 1), 1000); // Retry after 1 second
        }
      }
    } catch (error) {
      console.error('Error fetching printer locations:', error);
      if (retryCount > 0) {
        setTimeout(() => fetchPrinterLocations(retryCount - 1), 1000); // Retry after 1 second
      }
    }
  };

  useEffect(() => {
    fetchPrinterLocations();
  }, [department]);

  const handleLinkClick = (content) => {
    setModalContent(content);
    setIsAnyModalOpen(true);
    if (content === 'Add Orders') {
      setIsAddOrderModalOpen(true);
    } else if (content === 'Avail') {
      setIsAvailModalOpen(true);
    } else if (content === 'Contact Us') {
      setIsChatModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalContent(null);
    setIsAddOrderModalOpen(false);
    setIsAvailModalOpen(false);
    setIsChatModalOpen(false);
    setIsAnyModalOpen(false);
    fetchPrinterLocations();
  };

  const handlePrinterLocationChange = (e) => {
    setSelectedPrinterLocation(e.target.value);
    fetchPrinterLocations();
  };

  const containerStyle = (modalColor && modalColor !== '#ffffff') 
    ? { backgroundColor: modalColor, color: secondaryModalColor }
    : { backgroundImage: `url(${ustpImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };

  const textStyle = { color: secondaryModalColor === '#000000' ? '#ffffff' : secondaryModalColor };

  return (
    <div className="dashboard-container container-fluid vh-100 d-flex justify-content-center align-items-center" style={containerStyle}>
      {!isAnyModalOpen && (
        <div className="big-box-container text-center">
          <div className="logo-container mb-4">
            <img src={trailinkLogo} alt="Traillink Logo" className="logo img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          {userRole !== 'student' ? (
            <div className="printer-location-container">
              <select id="printer-location" value={selectedPrinterLocation} onChange={handlePrinterLocationChange} disabled className="form-select">
                <option value="" disabled>Loading...</option>
                {printerLocations.map((printer, index) => (
                  <option key={index} value={printer.location}>{printer.location}</option>
                ))}
              </select>
              <div className="description mt-3">
                <p>Welcome to the administrator page. Have a nice day!</p>
              </div>
            </div>
          ) : (
            <div className="description mt-3">
              <p>We offer free printing for the first 15 students per day, maximum of 10 pages.</p>
              <p>Just register below and wait for the code sent to your chatbox.</p>
              <div className="dashboard-button-container mt-3">
                <button className="avail-button btn btn-primary me-2" onClick={() => handleLinkClick('Avail')}>Avail Now</button>
                <button className="print-button btn btn-secondary" onClick={() => handleLinkClick('Add Orders')}>Print Now</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isAddOrderModalOpen} onClose={closeModal} content="Add Order">
        <AddOrderModal isOpen={isAddOrderModalOpen} onClose={closeModal} />
      </Modal>

      <Modal isOpen={isAvailModalOpen} onClose={closeModal} content="Avail">
        <AvailModal setContent={setModalContent} closeParentModal={closeModal} />
      </Modal>

      <Modal isOpen={isChatModalOpen} onClose={closeModal} content="Contact Us">
      </Modal>

      <ToastContainer />

      <button className="chat-button btn btn-info position-fixed bottom-0 end-0 m-3" onClick={() => handleLinkClick('Contact Us')}>
        <img src={chat} alt="Chat" className="chat-icon" />
        <span className="chat-text">CHAT US</span>
      </button>
    </div>
  );
}

export default Dashboard;