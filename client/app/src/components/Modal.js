import React, { useContext, useEffect } from 'react';
import './styles/Modal.css';
import ProfileModal from './Modals/ProfileModal';
import UserOrdersModal from './Modals/UserOrdersModal';
import AdminOrdersModal from './Modals/AdminOrdersModal';
import HistoryModal from './Modals/HistoryModal';
import SupplyModal from './Modals/SupplyModal';
import AvailModal from './Modals/AvailModal';
import ContactUsModal from './Modals/ContactUsModal';
import AddOrderModal from './Modals/AddOrderModal';
import AccountsModal from './Modals/AccountsModal';
import ScheduleModal from './Modals/ScheduleModal';
import UserDashboardModal from './Modals/UserDashboardModal';
import PrinterModal from './Modals/PrinterModal';
import LogsModal from './Modals/LogsModal';
import closeIcon from '../assets/close.png';
import TrailpayAdminModal from './Modals/TrailpayAdminModal';
import { UserContext } from '../context/UserContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

function Modal({ isOpen, onClose, children, content, setContent }) {
  const { userRole, setIsAnyModalOpen, user } = useContext(UserContext);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnyModalOpen(true);
    } else {
      document.body.style.overflow = 'auto';
      setIsAnyModalOpen(false);
    }
  }, [isOpen, setIsAnyModalOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (content) {
      case 'Profile':
        return <ProfileModal />;
      case 'Orders':
        return userRole === 'admin' 
          ? <AdminOrdersModal onClose={onClose} /> 
          : <UserOrdersModal onClose={onClose} />;
      case 'History':
        return <HistoryModal />;
      case 'Supply':
        return <SupplyModal />;
      case 'Avail':
        return <AvailModal setContent={setContent} closeParentModal={onClose} />;
      case 'Contact Us':
        return <ContactUsModal />;
      case 'Add Order':
        return <AddOrderModal isOpen={isOpen} onClose={() => handleClose(false)} />;
      case 'Accounts':
        return <AccountsModal />;
      case 'Schedule':
        return <ScheduleModal />;
      case 'Colors':
        return <UserDashboardModal isOpen={isOpen} onClose={onClose} />;
      case 'Logs':
        return <LogsModal />;
      case 'Printer':
        return <PrinterModal />;
      case 'TrailPayAdmin':
        return <TrailpayAdminModal isOpen={isOpen} onClose={onClose} />; // Ensure correct usage
      default:
        return children;
    }
  };

  const getModalClassName = () => {
    let className = 'modal-content';
    switch (content) {
      case 'Profile':
        className += ' profile-modal';
        break;
      case 'Orders':
        className += ' orders-modal';
        break;
      case 'History':
        className += ' history-modal';
        break;
      case 'Supply':
        className += ' supply-modal';
        break;
      case 'Avail':
        className += ' avail-modal allow-pointer-events';
        break;
      case 'Contact Us':
        className += ' contact-us-modal allow-pointer-events';
        break;
      case 'Add Order':
        className += ' add-order-modal allow-pointer-events';
        break;
      case 'Accounts':
        className += ' accounts-modal';
        break;
      case 'Schedule':
        className += ' schedule-modal';
        break;
      case 'Colors':
        className += ' colors-modal';
        break;
      case 'Logs':
        className += ' logs-modal';
        break;
      case 'Printer':
        className += ' printer-modal';
        break;
      case 'TrailPayAdmin':
        className += ' trailpay-modal';
        break;
      default:
        break;
    }
    return className;
  };

  const handleClose = (isUserInitiated) => {
    if (isUserInitiated && content === 'Add Order') {
      confirmAlert({
        title: 'Confirm to cancel order',
        message: 'Are you sure you want to close your order?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => onClose()
          },
          {
            label: 'No',
            onClick: () => {}
          }
        ]
      });
    } else {
      onClose();
    }
  };

  const shouldApplyModalColor = userRole !== 'admin' && !['History', 'Supply', 'Schedule', 'Accounts', 'Profile'].includes(content);

  return (
    <div className={`modal-overlay ${content === 'Orders' ? 'orders-overlay' : ''} ${['Avail', 'Contact Us', 'Add Order'].includes(content) ? 'allow-pointer-events' : ''}`}>
      <div className={getModalClassName()} style={shouldApplyModalColor ? { backgroundColor: user.secondaryModalColor, color: user.fontColor } : {}}>
        {content !== 'Orders' && (
          <button className="modal-close" onClick={() => handleClose(true)}>
            <img src={closeIcon} alt="Close" />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
}

export default Modal;