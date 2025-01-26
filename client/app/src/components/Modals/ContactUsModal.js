import React, { useState, useEffect, useContext, useRef } from 'react';
import './styles/ContactUsModal.css';
import { UserContext } from '../../context/UserContext';
import closeIcon from '../../assets/close.png';
import { QRCodeCanvas } from 'qrcode.react';
import trailink from '../../assets/trailink.png';
import send from '../../assets/send.png';
import userIcon from '../../assets/user.png'; // Import the user icon

const API_URL = process.env.REACT_APP_API_BASE_URL;

function ContactUsModal({ onClose }) {
  const { userEmail, userRole, modalColor } = useContext(UserContext);
  const [printers, setPrinters] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const [unseenMessages, setUnseenMessages] = useState(0);
  const [unseenMessagesCount, setUnseenMessagesCount] = useState({});

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`${API_URL}/api/printers/`);
        const data = await response.json();
        if (response.ok) {
          setPrinters(data);
          console.log('Fetched printers:', data);
        } else {
          console.error('Failed to fetch printers:', data);
        }
      } catch (error) {
        console.error('Error fetching printers:', error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`);
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
          console.log('Fetched current user:', data);
        } else {
          console.error('Failed to fetch current user:', data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchPrinters();
    fetchCurrentUser();
  }, [userEmail]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
          console.log('Fetched users:', data);
        } else {
          console.error('Failed to fetch users:', data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedLocation || currentUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedLocation, currentUser, userRole]);

  const fetchMessages = async (user = null) => {
    if (!selectedLocation) return;

    setLoadingMessages(true);
    setMessages([]); // Clear messages before loading new ones

    try {
      const response = await fetch(`${API_URL}/api/messages/`);
      const data = await response.json();
      if (response.ok) {
        let filteredMessages = [];
        if (userRole === 'admin') {
          filteredMessages = data.filter(msg => 
            (msg.receiver === user?.name || msg.sender === user?.name) && 
            msg.printer_location === selectedLocation
          );
        } else {
          filteredMessages = data.filter(msg => 
            msg.printer_location === selectedLocation && 
            (msg.sender === currentUser?.name || msg.receiver === currentUser?.name)
          );
        }
        setMessages(filteredMessages);

        setUnseenMessages(filteredMessages.filter(msg => !msg.seen).length); // Update unseen messages count
        console.log('Fetched messages:', filteredMessages);
      } else {
        console.error('Failed to fetch messages:', data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  const fetchUnseenMessagesCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/unseen_count/?email=${userEmail}`);
      const data = await response.json();
      if (response.ok) {
        const normalizedData = Object.keys(data).reduce((acc, key) => {
          acc[key.trim().toLowerCase()] = data[key];
          return acc;
        }, {});
        setUnseenMessagesCount(normalizedData);
        console.log('Fetched unseen messages count:', normalizedData);
      } else {
        console.error('Failed to fetch unseen messages count:', data);
      }
    } catch (error) {
      console.error('Error fetching unseen messages count:', error);
    }
  };
  useEffect(() => {
    fetchUnseenMessagesCount();
  }, [userEmail]);

  const hasUnseenMessages = (user) => {
    console.log(`Checking unseen messages for user: ${user.name}`);
    console.log(`Unseen messages count:`, unseenMessagesCount);
    
    if (!selectedLocation) {
      console.log('No selected location.');
      return false;
    }
    
    const locationKey = selectedLocation.trim().toLowerCase();
    const unseenMessagesForLocation = unseenMessagesCount[locationKey] || [];
    
    console.log(`Unseen messages array for location '${selectedLocation}':`, unseenMessagesForLocation);
    
    const userKey = user.name.trim().toLowerCase();
    const unseenCount = unseenMessagesForLocation.reduce((count, msg) => {
      if (msg.sender && msg.sender.trim().toLowerCase() === userKey) {
        return count + msg.count;
      }
      return count;
    }, 0);
    
    console.log(`Unseen messages for ${user.name} at location '${selectedLocation}': ${unseenCount}`);
    return unseenCount > 0;
  };
  
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    console.log('Selected user:', user);
    await fetchMessages(user);
    if (userRole === 'admin') {
      await markMessagesAsSeen(user);
    }
  };
  

  const handleLocationSelect = async (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    setSelectedUser(null);
    setMessages([]);
    console.log('Selected location:', location);
    await fetchMessages();
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      console.error('The message field cannot be empty.');
      return;
    }

    const payload = {
      senderName: currentUser.name,
      receiverNames: selectedUser ? [selectedUser.name] : [selectedLocation],
      message,
      printer_location: selectedLocation,
      qr_codes: [null]
    };

    try {
      const response = await fetch(`${API_URL}/api/messages/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('');
        console.log('Message sent:', data);
        await fetchMessages(selectedUser);
        await fetchUnseenMessagesCount(); // Refresh unseen messages count
      } else {
        console.error(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markMessagesAsSeen = async (user) => {
    if (userRole !== 'admin' || unseenMessages === 0) return; // Only execute for admins and if there are unseen messages
  
    try {
      const payload = {
        senderName: user ? user.name : null,
        printerLocation: selectedLocation,
      };
      const response = await fetch(`${API_URL}/api/messages/mark_as_seen/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setUnseenMessages(0); // Reset unseen messages count
  
        // Update unseen messages count for the selected user
        if (user) {
          setUnseenMessagesCount(prevCount => ({
            ...prevCount,
            [user.name]: 0
          }));
        }
        await fetchUnseenMessagesCount(); // Refresh unseen messages count
      } else {
        console.error('Failed to mark messages as seen');
      }
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && unseenMessages > 0) {
      markMessagesAsSeen(selectedUser);
    }
  }, [messages, unseenMessages]);

  const locations = [...new Set(printers.map(printer => printer.location))];

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="contact-us-modal">
      <div className="left-panel">
        <div className="dropdown-container">
          <div className="dropdown">
            <label htmlFor="location-select">Location</label>
            <select
              id="location-select"
              value={selectedLocation || ''}
              onChange={handleLocationSelect}
              disabled={loadingMessages}
            >
              <option value="" disabled>Select a location</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          {userRole === 'admin' && selectedLocation && (
            <>
              <input
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="contact-search-input"
              />
              <div className="user-list">
                {filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className="user-list-item"
                    onClick={() => handleUserSelect(user)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={user.profileImage || userIcon} alt={`${user.name}'s profile`} />
                      {user.name}
                    </div>
                    {hasUnseenMessages(user) && (
                      <span className="unseen-messages-badge">
                        {unseenMessagesCount[user.name]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="right-panel">
        <div className="chat-interface">
          {selectedUser || (userRole === 'student' && selectedLocation) ? (
            <>
              <div className="chat-header">
                Chatting to: {selectedUser ? selectedUser.name : selectedLocation}
              </div>
              <div className="messages">
                {loadingMessages ? (
                  <div>Loading messages...</div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === currentUser.name ? 'sent' : 'received'}`}>
                      <p>{msg.message}</p>
                      {msg.qr_code && (
                        <QRCodeCanvas value={msg.qr_code} size={128} />
                      )}
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input-container">
                <textarea
                  name="message"
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Type your message here..."
                />
                <button className="contact-send-button" type="button" onClick={handleSendMessage}>
                  <img src={send} alt="Send" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="centered-logo">
                <img src={trailink} alt="Trail-Ink Logo" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactUsModal;