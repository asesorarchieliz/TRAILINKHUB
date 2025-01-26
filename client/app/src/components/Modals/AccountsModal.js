import React, { useEffect, useState, useContext } from 'react';
import './styles/AccountsModal.css'; // Make sure to create this CSS file for styling
import { UserContext } from '../../context/UserContext'; // Import the UserContext
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { confirmAlert } from 'react-confirm-alert'; // Import react-confirm-alert
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import react-confirm-alert CSS
import block from '../../assets/block.png'; // Import the block icon
import delete2 from '../../assets/delete2.png'; // Import the delete icon

const API_URL = process.env.REACT_APP_API_BASE_URL;

function AccountsModal() {
  const { userRole } = useContext(UserContext); // Get the logged-in user's role from context
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 6;

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterDepartmentChange = (e) => {
    setFilterDepartment(e.target.value);
  };

  const handleFilterActiveChange = (e) => {
    setFilterActive(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}/delete/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success('Account deleted successfully!', { autoClose: 100 });
      fetchAccounts(); // Re-fetch accounts after successful delete
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account.', { autoClose: 100 });
    }
  };

  const handleBlock = async (id, isActive) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}/block/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !isActive }), // Toggle the active status
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success(`Account ${isActive ? 'blocked' : 'unblocked'} successfully!`, { autoClose: 100 });
      fetchAccounts(); // Re-fetch accounts after successful block/unblock
    } catch (error) {
      console.error(`Error ${isActive ? 'blocking' : 'unblocking'} account:`, error);
      toast.error(`Failed to ${isActive ? 'block' : 'unblock'} account.`, { autoClose: 100 });
    }
  };

  const confirmDelete = (id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleDelete(id)
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const confirmBlock = (id, isActive) => {
    confirmAlert({
      title: `Confirm to ${isActive ? 'block' : 'unblock'}`,
      message: `Are you sure you want to ${isActive ? 'block' : 'unblock'} this user?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleBlock(id, isActive)
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.year.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || account.department === filterDepartment;
    const matchesActive = filterActive === 'all' || (filterActive === 'active' && account.active) || (filterActive === 'inactive' && !account.active);
    return matchesSearch && matchesDepartment && matchesActive;
  });

  // Pagination logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="accounts-modal">
      <ToastContainer /> 
      <h2>Student Accounts</h2>
      <div className="filter-container mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select className="form-select mb-2" value={filterDepartment} onChange={handleFilterDepartmentChange}>
          <option value="all">All Departments</option>
          <option value="CITC">CITC</option>
          <option value="CEA">CEA</option>
          <option value="CSM">CSM</option>
          <option value="CST">CST</option>
        </select>
        <select className="form-select" value={filterActive} onChange={handleFilterActiveChange}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="accounts-table-container table-responsive">
        <table className="accounts-table table table-striped">
          <thead>
            <tr>
              <th>No</th>
              <th>Registered Date</th>
              <th>Full Name</th>
              <th>ID Number</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Course</th>
              <th>Dept.</th>
              <th>Year</th>
              <th>Last Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentAccounts.map((account, index) => (
              <tr key={account.id}>
                <td>{indexOfFirstAccount + index + 1}
                  <br />
                  {userRole === 'admin' ? account.active ? 'Active' : 'Blocked' : ''}
                </td>
                <td>{new Date(account.created_at).toLocaleDateString()}</td>
                <td>{account.name}</td>
                <td>{account.id_number}</td>
                <td>{account.email}</td>
                <td>{account.phone}</td>
                <td>{account.course}</td>
                <td>{account.department}</td>
                <td>{account.year}</td>
                <td>{new Date(account.last_login).toLocaleString()}</td>
                <td>
                  <button className="delete-button btn btn-danger btn-sm me-2" onClick={() => confirmDelete(account.id)}>
                    <img src={delete2} alt="Delete" />
                  </button>
                  <button className="block-button btn btn-warning btn-sm" onClick={() => confirmBlock(account.id, account.active)}>
                    <img src={block} alt={account.active ? 'Block' : 'Unblock'} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination d-flex justify-content-center mt-3">
        <button
          className="btn btn-primary me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`btn ${currentPage === index + 1 ? 'btn-secondary' : 'btn-outline-secondary'} me-2`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn btn-primary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AccountsModal;