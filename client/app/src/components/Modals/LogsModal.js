import React, { useEffect, useState, useContext } from 'react';
import './styles/LogsModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../../context/UserContext'; 
import RenderLogs from './LogsRender/renderLogs';
import RenderLogBook from './LogsRender/renderLogBook';
import RenderVoucherHistory from './LogsRender/renderVoucherHistory';
import RenderAdminLogs from './LogsRender/renderAdminLogs';
import RenderAvailHistory from './LogsRender/renderAvailHistory';
import { Cloudinary } from 'cloudinary-core';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const cloudinary = new Cloudinary({ cloud_name: 'djgtuj9zv', secure: true });

function LogsModal() {
  const { userEmail } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState('student');
  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [collegeLevel, setCollegeLevel] = useState('');
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchAdmins(); // Fetch admins when the modal opens
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLogs(data.sort((a, b) => new Date(b.date_time) - new Date(a.date_time))); // Sort logs by date_time in descending order
    } catch (error) {
      toast.error(`Failed to fetch logs: ${error.message}`);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admins/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      toast.error(`Failed to fetch admins: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedOption === 'voucherHistory') {
      const fetchVouchers = async () => {
        try {
          const response = await fetch(`${API_URL}/api/discount_vouchers/`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setVouchers(data);
        } catch (error) {
          toast.error(`Failed to fetch vouchers: ${error.message}`);
        }
      };

      fetchVouchers();
    } else if (selectedOption === 'availHistory') {
      fetchUsers();
    }
  }, [selectedOption]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
    }
  };

  const filteredLogs = logs.filter(log => {
    const logDate = log.date_time ? new Date(log.date_time).toISOString().split('T')[0] : '';
    const matchesText = searchText === '' || 
      (log.name && log.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (log.id_number && log.id_number.toLowerCase().includes(searchText.toLowerCase())) ||
      (log.activity && log.activity.toLowerCase().includes(searchText.toLowerCase()));
    const matchesDate = searchDate === '' || logDate === searchDate;
    const matchesStartDate = !startDate || new Date(log.date_time) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(log.date_time) <= new Date(endDate);
    const matchesRole = log.role === selectedOption;
    return matchesText && matchesDate && matchesStartDate && matchesEndDate && matchesRole;
  });
  
  const filteredAdmins = admins
  .filter(admin => {
    const matchesText = searchText === '' || 
      (admin.name && admin.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (admin.email && admin.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (admin.activity && admin.activity.toLowerCase().includes(searchText.toLowerCase()));
    const matchesDate = searchDate === '' || (admin.date_time && new Date(admin.date_time).toISOString().split('T')[0] === searchDate);
    const matchesStartDate = !startDate || new Date(admin.date_time) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(admin.date_time) <= new Date(endDate);
    return matchesText && matchesDate && matchesStartDate && matchesEndDate;
  })
  .sort((a, b) => new Date(b.date_time) - new Date(a.date_time)); // Sort by date_time in descending order

  const filteredUsers = (users || [])
  .filter(user => {
    const userDate = user.last_free_printing_availment ? new Date(user.last_free_printing_availment).toISOString().split('T')[0] : 'NA';
    const matchesText = searchText === '' || 
      (user.name && user.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.id_number && user.id_number.toLowerCase().includes(searchText.toLowerCase()));
    const matchesDate = searchDate === '' || userDate === searchDate;
    const matchesStartDate = !startDate || new Date(user.last_free_printing_availment) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(user.last_free_printing_availment) <= new Date(endDate);
    const isNotAdmin = user.name.toLowerCase() !== 'admin';
    const isValidStatus = user.avail_status === 'Availing' || user.avail_status === 'Availed';
    return matchesText && matchesDate && matchesStartDate && matchesEndDate && isNotAdmin && isValidStatus;
  })
  .sort((a, b) => {
    const dateA = a.last_free_printing_availment ? new Date(a.last_free_printing_availment) : new Date(0);
    const dateB = b.last_free_printing_availment ? new Date(b.last_free_printing_availment) : new Date(0);
    return dateB - dateA;
  });

  const handleSignatureChange = (e) => {
    setSignature(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('year', year);
    formData.append('activity', 'Log Book Entry');
    formData.append('role', 'admin');
    formData.append('id_number', studentId); // Ensure id_number is included
  
    if (signature) {
      // Upload signature image to Cloudinary
      const formDataForCloudinary = new FormData();
      formDataForCloudinary.append('file', signature);
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
      const signatureUrl = data.secure_url;
      formData.append('signature', signatureUrl); // Update formData with the Cloudinary URL
    }
  
    try {
      const response = await fetch(`${API_URL}/api/log_book/`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setLogs([...logs, data].sort((a, b) => new Date(b.date_time) - new Date(a.date_time))); // Sort logs by date_time in descending order
      toast.success('Log book entry submitted successfully');
      fetchLogs(); // Refetch logs after successful submission
  
      // Clear all inputs
      setName('');
      setYear('');
      setStudentId(''); // Clear studentId input
      setProgram('');
      setCollegeLevel('');
      setSignature(null);
    } catch (error) {
      toast.error(`Failed to submit log book entry: ${error.message}`);
    }
  };

  const handleDeleteVoucher = async (voucherCode) => {
    try {
      const response = await fetch(`${API_URL}/api/delete_voucher/${voucherCode}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVouchers(vouchers.filter(voucher => voucher.discount_code !== voucherCode));
      toast.success(data.message);
    } catch (error) {
      toast.error(`Failed to delete voucher: ${error.message}`);
    }
  };

  const handleReavail = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/update-avail-status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avail_status: 'Not availed' }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log(`User ${userId} status updated to Not availed.`);
      toast.success(`User ${userId} status updated to Not availed.`);
      fetchUsers(); // Refetch users after successful reavail
    } catch (error) {
      console.error(`Error updating user ${userId} status to Not availed:`, error);
      toast.error(`Failed to update user status: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'student':
        return <RenderLogs filteredLogs={filteredLogs} searchDate={searchDate} setSearchDate={setSearchDate} searchText={searchText} setSearchText={setSearchText} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />;
      case 'admin':
        return <RenderAdminLogs filteredAdmins={filteredAdmins} adminLogs={logs.filter(log => log.role === 'admin')} searchDate={searchDate} setSearchDate={setSearchDate} searchText={searchText} setSearchText={setSearchText} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />;
      case 'logBook':
        return <RenderLogBook
            admins={admins}
            name={name}
            setName={setName}
            year={year}
            setYear={setYear}
            studentId={studentId}
            setStudentId={setStudentId}
            program={program}
            setProgram={setProgram}
            collegeLevel={collegeLevel}
            setCollegeLevel={setCollegeLevel}
            handleSignatureChange={handleSignatureChange}
            handleSubmit={handleSubmit}
          />;
      case 'voucherHistory':
        return <RenderVoucherHistory vouchers={vouchers} handleDeleteVoucher={handleDeleteVoucher} />;
      case 'availHistory':
        return <RenderAvailHistory sortedUsers={filteredUsers} searchDate={searchDate} setSearchDate={setSearchDate} searchText={searchText} setSearchText={setSearchText} handleReavail={handleReavail} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />;
      default:
        return null;
    }
  };

  return (
    <div className="logs-modal">
      <ToastContainer />
      <div className="logs-modal-container">
        <div className="logs-modal-sidebar">
          <h2>Logs</h2>
          <div className="logs-options">
            <button className={`logs-modal-option ${selectedOption === 'student' ? 'active' : ''}`} onClick={() => setSelectedOption('student')}>Student Logs</button>
            <button className={`logs-modal-option ${selectedOption === 'admin' ? 'active' : ''}`} onClick={() => setSelectedOption('admin')}>Admin Logs</button>
            <button className={`logs-modal-option ${selectedOption === 'logBook' ? 'active' : ''}`} onClick={() => setSelectedOption('logBook')}>Log Book</button>
            <button className={`logs-modal-option ${selectedOption === 'voucherHistory' ? 'active' : ''}`} onClick={() => setSelectedOption('voucherHistory')}>Voucher History</button>
            <button className={`logs-modal-option ${selectedOption === 'availHistory' ? 'active' : ''}`} onClick={() => setSelectedOption('availHistory')}>Avail History</button>
          </div>
        </div>
        <div className="logs-modal-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default LogsModal;