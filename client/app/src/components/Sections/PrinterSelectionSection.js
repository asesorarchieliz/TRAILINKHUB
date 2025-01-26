import React from 'react';
import './styles/PrinterSelectionSection.css';
import { toast } from 'react-toastify';

function PrinterSelectionSection({ selectedLocation, setSelectedLocation, locations, selectedPrinter, setSelectedPrinter, printers, setPrinterStatus }) {
  const handlePrinterSelect = (printer) => {
    setSelectedPrinter(printer.name);
    setPrinterStatus(printer.status);
    if (printer.status !== 'active') {
      const estimatedTime = printer.status_estimated_time ? new Date(printer.status_estimated_time).toLocaleString() : 'unknown time';
      toast.error(`Printer temporarily not available. Please come back in ${estimatedTime}.`);
    }
  };

  return (
    <div className="printer-selection-container">
      <div className="printer-location">
        <h2>Locations</h2>
        <hr />
        <div className="form-group">
          <label>Select Location:</label>
          <hr />
          <div className="location-options">
            {locations
              .filter(location => location) // Filter out empty locations
              .map(location => (
                <div key={location} className="location-option">
                  <label>
                    <input
                      type="radio"
                      value={location}
                      checked={selectedLocation === location}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                    {location} {/* Ensure location is a string */}
                  </label>
                </div>
              ))}
          </div>
        </div>
      </div>
      <hr className="divider" />
      <div className="printer-options-container">
        <h2>Printers</h2>
        <hr />
        <div className="form-group">
          <label>Select Printer:</label>
          <hr />
          <div className="printer-options">
            {printers
              .filter(printer => printer.location === selectedLocation && printer.name) // Filter out printers without a name or with a null name
              .map(printer => (
                <div key={printer.id} className={`printer-option ${printer.status !== 'active' ? 'inactive' : ''}`}>
                  <label>
                    <input
                      type="radio"
                      value={printer.name}
                      checked={selectedPrinter === printer.name}
                      onChange={() => handlePrinterSelect(printer)}
                    />
                    {printer.name} {/* Ensure printer.name is a string */}
                  </label>
                  <span className={`printer-status ${printer.status === 'active' ? 'active' : 'inactive'}`}>
                    {printer.status} {/* Ensure printer.status is a string */}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrinterSelectionSection;