import React, { useState, useContext, useEffect } from 'react';
import './styles/PrinterModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../../context/UserContext';
import editIcon from '../../assets/edit.png';
import deleteIcon from '../../assets/delete.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function PrinterModal() {
    const { setPrinterLocations, department } = useContext(UserContext);
  const [printers, setPrinters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLocation, setNewLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedSection, setSelectedSection] = useState('addPrinter');
  const [activePrinterLocation, setActivePrinterLocation] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPrinter, setNewPrinter] = useState({ name: '', status: 'active', brand: '', location: '', status_estimated_time: null });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrinters();
    fetchOrders();
  }, [startDate, endDate]);

  const fetchPrinters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/printers/`);
      const data = await response.json();
      setPrinters(data);
      setLocations([...new Set(data.map(printer => printer.location))]);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to fetch printers');
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const handleAddLocation = async () => {
    if (locations.includes(newLocation)) {
      toast.error('Location already exists');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/locations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: newLocation, name: '', brand: '', status: 'active' }),
      });
      if (response.ok) {
        toast.success('Location added successfully');
        fetchPrinters();
        setNewLocation('');
        setPrinterLocations(prevLocations => [...prevLocations, newLocation]);
      } else {
        toast.error('Failed to add location');
      }
    } catch (error) {
      toast.error('Failed to add location');
    }
  };

  const handleDeleteLocation = async (location) => {
    try {
      const response = await fetch(`${API_URL}/api/locations/${location}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Location and associated printers deleted successfully');
        fetchPrinters();
      } else {
        toast.error('Failed to delete location');
      }
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const handleAddPrinter = async (printerData) => {
    if (printers.some(printer => printer.name === printerData.name && printer.location === printerData.location)) {
      toast.error('Printer with the same name or location already exists');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/printers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printerData),
      });
      if (response.ok) {
        toast.success('Printer added successfully');
        fetchPrinters();
        setNewPrinter({ name: '', status: 'active', brand: '', location: '' });
      } else {
        toast.error('Failed to add printer');
      }
    } catch (error) {
      toast.error('Failed to add printer');
    }
  };

  const handleEditPrinter = (printer) => {
    setIsEditing(true);
    setEditingPrinterId(printer.id);
    setNewPrinter({ name: printer.name, status: printer.status, brand: printer.brand, location: printer.location, status_estimated_time: printer.status_estimated_time });
    setShowEditModal(true);
  };
  
  const handleUpdatePrinter = async () => {
    if (printers.some(printer => (printer.name === newPrinter.name && printer.location === newPrinter.location) && printer.id !== editingPrinterId)) {
      toast.error('Printer with the same name or location already exists');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/printers/${editingPrinterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrinter),
      });
      if (response.ok) {
        toast.success('Printer updated successfully');
        fetchPrinters();
        setIsEditing(false);
        setEditingPrinterId(null);
        setNewPrinter({ name: '', status: 'active', brand: '', location: '', status_estimated_time: null });
        setShowEditModal(false);
      } else {
        toast.error('Failed to update printer');
      }
    } catch (error) {
      toast.error('Failed to update printer');
    }
  };

  const handleDeletePrinter = async (printerId) => {
    try {
      await fetch(`${API_URL}/api/printers/${printerId}`, {
        method: 'DELETE',
      });
      toast.success('Printer deleted successfully');
      fetchPrinters(); // Refresh the list
      setIsEditing(false);
      setEditingPrinterId(null);
      setNewPrinter({ name: '', status: 'active', brand: '', location: '' });
    } catch (error) {
      toast.error('Failed to delete printer');
    }
  };

  const getTotalSales = (printer) => {
    const startDateString = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
    const endDateString = endDate ? new Date(endDate).toISOString().split('T')[0] : null;
  
    const completedOrders = orders.filter(order => {
      const orderDateString = new Date(order.date_time).toISOString().split('T')[0];
      return order.status === 'Completed' && 
             order.printer_name === printer.name && 
             (!startDateString || orderDateString >= startDateString) &&
             (!endDateString || orderDateString <= endDateString);
    });
  
    const totalSales = completedOrders.reduce((total, order) => total + Number(order.total_price), 0);
    return totalSales;
  };

  function getStatusClass(status) {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  }

  const getPrinterCountByLocation = (location) => {
    return printers.filter(printer => printer.location === location && printer.name).length;
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="printer-modal container">
      <ToastContainer />
      <div className="sidebar btn-group-vertical">
        <button className="btn btn-primary" onClick={() => setSelectedSection('addPrinter')}>Add Printer</button>
        <button className="btn btn-primary" onClick={() => setSelectedSection('locations')}>Locations</button>
        <button className="btn btn-primary" onClick={() => setSelectedSection('printers')}>Printers</button>
        <button className="btn btn-primary" onClick={() => setSelectedSection('salesStatus')}>Sales Status</button>
      </div>
      <div className="main-content">
        {selectedSection === 'addPrinter' && (
          <div className="printer-form">
            <h2>Add Printer</h2>
            <select
              className="form-select"
              value={newPrinter.location}
              onChange={(e) => setNewPrinter({ ...newPrinter, location: e.target.value })}
            >
              <option value="">Select Location</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Printer Name"
              value={newPrinter.name}
              onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Printer Brand"
              value={newPrinter.brand}
              onChange={(e) => setNewPrinter({ ...newPrinter, brand: e.target.value })}
            />
            <select
              className="form-select"
              value={newPrinter.status}
              onChange={(e) => setNewPrinter({ ...newPrinter, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="add-printer-button btn btn-success" onClick={() => handleAddPrinter(newPrinter)}>
              Add Printer
            </button>
          </div>
        )}
        {selectedSection === 'locations' && (
          <div className="location-form">
            <h2>Add Location</h2>
            <input
              type="text"
              className="form-control"
              placeholder="Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button className="add-location-button btn btn-success" onClick={handleAddLocation}>
              Add Location
            </button>
            <h2>Existing Locations</h2>
            <div className="location-table-container table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location, index) => (
                    <tr key={index}>
                      <td>{location}</td>
                      <td>
                        <button onClick={() => handleDeleteLocation(location)} className="icon-button btn btn-danger">
                          <img src={deleteIcon} alt="Delete" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedSection === 'printers' && (
          <div className="printer-table-container table-responsive">
            <h2>Printers</h2>
            <div className="filter-container btn-group">
              <button
                className={`filter-button btn btn-secondary ${filterLocation === '' ? 'active' : ''}`}
                onClick={() => setFilterLocation('')}
              >
                All ({printers.filter(printer => printer.name).length})
              </button>
              {locations.map((location, index) => (
                <button
                  key={index}
                  className={`filter-button btn btn-secondary ${filterLocation === location ? 'active' : ''}`}
                  onClick={() => setFilterLocation(location)}
                >
                  {location} ({getPrinterCountByLocation(location)})
                </button>
              ))}
            </div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Printer Name</th>
                    <th>Printer Brand</th>
                    <th>Printer Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {printers
                    .filter(printer => printer.name) // Filter out printers without a name
                    .filter(printer => filterLocation === '' || printer.location === filterLocation)
                    .map((printer) => (
                      <tr key={printer.id}>
                        <td>{printer.location}</td>
                        <td>{printer.name}</td>
                        <td>{printer.brand}</td>
                        <td>{printer.status}</td>
                        <td>
                          <button onClick={() => handleEditPrinter(printer)} className="icon-button btn btn-warning">
                            <img src={editIcon} alt="Edit" />
                          </button>
                          <button onClick={() => handleDeletePrinter(printer.id)} className="icon-button btn btn-danger">
                            <img src={deleteIcon} alt="Delete" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {selectedSection === 'salesStatus' && (
          <div className="sales-status-dashboard">
            <h2>Sales Status Dashboard</h2>
            <div className="printer-date-picker-container">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
                isClearable
                placeholderText="Start Date"
                className="form-control"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
                isClearable
                placeholderText="End Date"
                className="form-control"
              />
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Search Printer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {printers
              .filter(printer => printer.name && printer.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(printer => printer.name) // Filter out printers without a name
              .map((printer) => (
                <div key={printer.id} className={`sales-status-box ${getStatusClass(printer.status)}`}>
                  <h3>{printer.name}: {printer.location}</h3>
                  <div className="sales-status-content">
                    <div className="sales-status-right">
                      <p>Actual Sales: P{getTotalSales(printer).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {showEditModal && (
        <div className="printer-edit-modal modal show d-block">
          <div className="printer-edit-modal-content modal-content">
            <h2>Edit Printer</h2>
            <input
              type="text"
              className="form-control"
              placeholder="Location"
              value={newPrinter.location}
              onChange={(e) => setNewPrinter({ ...newPrinter, location: e.target.value })}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Printer Name"
              value={newPrinter.name}
              onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Printer Brand"
              value={newPrinter.brand}
              onChange={(e) => setNewPrinter({ ...newPrinter, brand: e.target.value })}
            />
            {newPrinter.status === 'inactive' && (
              <DatePicker
                selected={newPrinter.status_estimated_time}
                onChange={(date) => setNewPrinter({ ...newPrinter, status_estimated_time: date })}
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Select estimated time"
                className="form-control"
              />
            )}
            <select
              className="form-select"
              value={newPrinter.status}
              onChange={(e) => setNewPrinter({ ...newPrinter, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="add-printer-button btn btn-success" onClick={handleUpdatePrinter}>
              Update Printer
            </button>
            <button className="close-modal-button btn btn-secondary" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrinterModal;