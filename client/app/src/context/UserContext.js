import React, { createContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [idNumber, setIdNumber] = useState(localStorage.getItem('userID') || '');
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [profileImageChanged, setProfileImageChanged] = useState(false);
  const [printerLocations, setPrinterLocations] = useState([]);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [isFreePrintingAvailed, setIsFreePrintingAvailed] = useState(false);
  const [selectedPrinterLocation, setSelectedPrinterLocation] = useState(localStorage.getItem('selectedPrinterLocation') || '');
  const [trailpayPoints, setTrailpayPoints] = useState(parseInt(localStorage.getItem('trailpayPoints'), 10) || 0);
  const [department, setDepartment] = useState(localStorage.getItem('department') || ''); // Add department state
  const [user, setUser] = useState({
    modalColor: localStorage.getItem('modalColor') || '#dbf8ff',
    secondaryModalColor: localStorage.getItem('secondaryModalColor') || '#f4f4f4',
    fontColor: localStorage.getItem('fontColor') || '#000000',
  });

  const setModalColor = (color) => {
    setUser((prevUser) => {
      if (prevUser.modalColor !== color) {
        localStorage.setItem('modalColor', color);
        return { ...prevUser, modalColor: color };
      }
      return prevUser;
    });
  };

  const setSecondaryModalColor = (color) => {
    setUser((prevUser) => {
      if (prevUser.secondaryModalColor !== color) {
        localStorage.setItem('secondaryModalColor', color);
        return { ...prevUser, secondaryModalColor: color };
      }
      return prevUser;
    });
  };

  const setFontColor = (color) => {
    setUser((prevUser) => {
      if (prevUser.fontColor !== color) {
        localStorage.setItem('fontColor', color);
        return { ...prevUser, fontColor: color };
      }
      return prevUser;
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`);
        const data = await response.json();
        if (response.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            modalColor: data.modalColor || '#dbf8ff',
            secondaryModalColor: data.secondaryModalColor || '#f4f4f4',
            fontColor: data.fontColor || '#000000',
          }));
          setDepartment(data.department || ''); // Set department state
          if (!name) {
            setName(data.name || ''); // Set name if it's empty
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userEmail) {
      fetchUserData();
    }
  }, [userEmail, name]);

  useEffect(() => {
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userID', idNumber);
    localStorage.setItem('name', name);
    localStorage.setItem('modalColor', user.modalColor);
    localStorage.setItem('secondaryModalColor', user.secondaryModalColor);
    localStorage.setItem('fontColor', user.fontColor);
    localStorage.setItem('selectedPrinterLocation', selectedPrinterLocation || '');
    localStorage.setItem('trailpayPoints', trailpayPoints);
    localStorage.setItem('department', department); // Store department in localStorage
    console.log('Free printing availed: ' + isFreePrintingAvailed);
    console.log('Selected printer location: ' + selectedPrinterLocation);
  }, [userEmail, userRole, idNumber, name, isFreePrintingAvailed, user.modalColor, user.secondaryModalColor, user.fontColor, selectedPrinterLocation, trailpayPoints, department]);

  return (
    <UserContext.Provider value={{
      userEmail,
      setUserEmail,
      userRole,
      setUserRole,
      idNumber,
      setIdNumber,
      name,
      setName,
      profileImageChanged,
      setProfileImageChanged,
      isAnyModalOpen,
      setIsAnyModalOpen,
      isFreePrintingAvailed,
      setIsFreePrintingAvailed,
      selectedPrinterLocation,
      setSelectedPrinterLocation,
      printerLocations,
      setPrinterLocations,
      trailpayPoints,
      setTrailpayPoints,
      department, // Provide department in context
      setDepartment,
      user,
      setUser,
      setModalColor,
      modalColor: user.modalColor,
      secondaryModalColor: user.secondaryModalColor,
      setSecondaryModalColor,
      setFontColor,
      fontColor: user.fontColor,
    }}>
      {children}
    </UserContext.Provider>
  );
};