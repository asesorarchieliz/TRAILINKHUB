import React, { useEffect, useState } from 'react';
import './styles/SupplyModal.css'; // Make sure to create this CSS file for styling
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { FaFileAlt, FaTint } from 'react-icons/fa'; // Import icons from react-icons
import { fetchAndUpdateSupplies, fetchPrinters, updateSupplies } from '../../utils/supplyUtil'; // Import utility functions

const API_URL = process.env.REACT_APP_API_BASE_URL;

function SupplyModal() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [supplies, setSupplies] = useState({
    a4_supplies: 0,
    letter_supplies: 0,
    legal_supplies: 0,
    blue_ink: 0,
    yellow_ink: 0,
    red_ink: 0,
    black_ink: 0,
  });

  useEffect(() => {
    const fetchAndSetPrinters = async () => {
      await fetchPrinters(setPrinters, setSelectedPrinter);
    };
    fetchAndSetPrinters();
  }, []);

  useEffect(() => {
    if (selectedPrinter) {
      fetchAndUpdateSupplies(selectedPrinter.location, supplies, setSupplies);
    }
  }, [selectedPrinter]);

  const handlePrinterSelect = (printer) => {
    setSelectedPrinter(printer);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupplies((prevSupplies) => ({
      ...prevSupplies,
      [name]: value,
    }));
  };

  const handleSubmitSupplies = async (e) => {
    e.preventDefault();
    await updateSupplies(selectedPrinter.location, supplies);
    checkLowSupplies();
  };

  const convertPagesToPercentage = (pages) => {
    return Math.min(Math.floor((pages / 250) * 100), 100);
  };

  const checkLowSupplies = () => {
    const lowInkThreshold = 1; // Example threshold for low ink
    const lowPaperThreshold = 25; // Example threshold for low paper percentage

    let lowSuppliesMessages = [];

    if (supplies.blue_ink <= lowInkThreshold) {
      lowSuppliesMessages.push('Blue ink is low!');
    }
    if (supplies.yellow_ink <= lowInkThreshold) {
      lowSuppliesMessages.push('Yellow ink is low!');
    }
    if (supplies.red_ink <= lowInkThreshold) {
      lowSuppliesMessages.push('Red ink is low!');
    }
    if (supplies.black_ink <= lowInkThreshold) {
      lowSuppliesMessages.push('Black ink is low!');
    }

    if (convertPagesToPercentage(supplies.a4_supplies) <= lowPaperThreshold) {
      lowSuppliesMessages.push('A4 paper is low!');
    }
    if (convertPagesToPercentage(supplies.letter_supplies) <= lowPaperThreshold) {
      lowSuppliesMessages.push('Letter paper is low!');
    }
    if (convertPagesToPercentage(supplies.legal_supplies) <= lowPaperThreshold) {
      lowSuppliesMessages.push('Legal paper is low!');
    }

    if (lowSuppliesMessages.length > 0) {
      toast.warn(lowSuppliesMessages.join(' '));
    }
  };

  return (
    <div className="supply-modal">
      <ToastContainer style={{ zIndex: 9999 }} /> {/* Add ToastContainer with custom zIndex */}
      <div className="supply-content-container">
        <div className="supply-sidebar">
          <h3>Printers</h3>
          <ul>
            {printers.map((printer) => (
              <li
                key={printer.id}
                className={selectedPrinter && selectedPrinter.id === printer.id ? 'supply-selected' : ''}
                onClick={() => handlePrinterSelect(printer)}
              >
                {printer.location}
              </li>
            ))}
          </ul>
        </div>
        <div className="supply-form-container">
          {selectedPrinter && (
            <form onSubmit={handleSubmitSupplies} className="supply-form">
              <h3>Supplies for {selectedPrinter.location}</h3>
              <div className="supply-grid-container">
                <div className="supply-section">
                  <h3>Bondpaper Supplies</h3>
                  <div className="supply-grid">
                    <div className="supply-item">
                      <FaFileAlt className="supply-icon" />
                      <div className="supply-input-group">
                        <label>A4</label>
                        <input
                          type="number"
                          name="a4_supplies"
                          value={supplies.a4_supplies}
                          onChange={handleInputChange}
                        />
                        <span>pages available ({convertPagesToPercentage(supplies.a4_supplies)}%)</span>
                      </div>
                    </div>
                    <div className="supply-item">
                      <FaFileAlt className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Letter</label>
                        <input
                          type="number"
                          name="letter_supplies"
                          value={supplies.letter_supplies}
                          onChange={handleInputChange}
                        />
                        <span>pages available ({convertPagesToPercentage(supplies.letter_supplies)}%)</span>
                      </div>
                    </div>
                    <div className="supply-item">
                      <FaFileAlt className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Legal</label>
                        <input
                          type="number"
                          name="legal_supplies"
                          value={supplies.legal_supplies}
                          onChange={handleInputChange}
                        />
                        <span>pages available ({convertPagesToPercentage(supplies.legal_supplies)}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="supply-section">
                  <h3>Ink Stocks</h3>
                  <div className="supply-grid">
                    <div className="supply-item">
                      <FaTint className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Blue Ink</label>
                        <input
                          type="number"
                          name="blue_ink"
                          value={supplies.blue_ink}
                          onChange={handleInputChange}
                        />
                        <span>stock(s)</span>
                      </div>
                    </div>
                    <div className="supply-item">
                      <FaTint className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Yellow Ink</label>
                        <input
                          type="number"
                          name="yellow_ink"
                          value={supplies.yellow_ink}
                          onChange={handleInputChange}
                        />
                        <span>stock(s)</span>
                      </div>
                    </div>
                    <div className="supply-item">
                      <FaTint className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Red Ink</label>
                        <input
                          type="number"
                          name="red_ink"
                          value={supplies.red_ink}
                          onChange={handleInputChange}
                        />
                        <span>stock(s)</span>
                      </div>
                    </div>
                    <div className="supply-item">
                      <FaTint className="supply-icon" />
                      <div className="supply-input-group">
                        <label>Black Ink</label>
                        <input
                          type="number"
                          name="black_ink"
                          value={supplies.black_ink}
                          onChange={handleInputChange}
                        />
                        <span>stock(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="supply-button-group">
                <button type="submit" className="supply-submit-button">Update Supplies</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplyModal;