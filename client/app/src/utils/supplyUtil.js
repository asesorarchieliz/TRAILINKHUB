import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchPrinters = async (setPrinters, setSelectedPrinter) => {
  try {
    const response = await fetch(`${API_URL}/api/printers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    // Filter printers with unique locations
    const uniqueLocations = new Set();
    const filteredPrinters = data.filter(printer => {
      if (!uniqueLocations.has(printer.location)) {
        uniqueLocations.add(printer.location);
        return true;
      }
      return false;
    });
    setPrinters(filteredPrinters);
    if (filteredPrinters.length > 0) {
      setSelectedPrinter(filteredPrinters[0]);
    }
  } catch (error) {
    console.error('Error fetching printers:', error);
    toast.error('Failed to fetch printers.');
  }
};

export const fetchAndUpdateSupplies = async (printerLocation, supplies, setSupplies) => {
  try {
    // Fetch supplies
    const fetchResponse = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(printerLocation)}/`);
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      setSupplies(fetchData);
      console.log('Supplies fetched successfully:', fetchData);
    } else if (fetchResponse.status === 404) {
      console.error('Supplies not found. Creating new supplies.');
      // Handle creating new supplies if not found
      const createResponse = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(printerLocation)}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...supplies, printer_location: printerLocation }),
      });
      if (createResponse.ok) {
        const createData = await createResponse.json();
        setSupplies(createData);
        console.log('Supplies created successfully:', createData);
      } else {
        const errorData = await createResponse.text();
        console.error('Failed to create supplies:', errorData);
      }
    } else {
      const errorData = await fetchResponse.text();
      console.error(`Failed to fetch supplies: ${fetchResponse.status} ${fetchResponse.statusText}`, errorData);
    }
  } catch (error) {
    console.error('Error fetching and updating supplies:', error);
  }
};

export const fetchSupplies = async (location, setSupplies) => {
  try {
    const response = await fetch(`${API_URL}/api/supply/location/${encodeURIComponent(location)}/`);
    const data = await response.json();
    if (response.ok) {
      setSupplies(data);
    } else {
      console.error('Failed to fetch supplies:', data);
    }
  } catch (error) {
    console.error('Error fetching supplies:', error);
  }
};

export const updateSupplies = async (printerLocation, supplies) => {
  try {
    // Ensure all supply values are integers and handle None values
    const sanitizedSupplies = {};
    for (const [key, value] of Object.entries(supplies)) {
      sanitizedSupplies[key] = value !== null ? Math.max(0, parseInt(value, 10)) : 0;
    }

    // Ensure printer_location is included in the request body
    sanitizedSupplies.printer_location = printerLocation;

    const response = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(printerLocation)}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedSupplies),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Supplies updated successfully:', data);
      toast.success('Supplies updated successfully!');
    } else {
      const errorData = await response.text();
      console.error(`Failed to update supplies: ${response.status} ${response.statusText}`, errorData);
      toast.error('Failed to update supplies.');
    }
  } catch (error) {
    console.error('Error updating supplies:', error);
    toast.error('Error updating supplies.');
  }
};

export const addPrinter = async (newPrinter, fetchPrinters) => {
  try {
    const response = await fetch(`${API_URL}/api/printers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPrinter),
    });
    if (response.ok) {
      toast.success('Printer added successfully!');
      fetchPrinters(); // Refresh the list of printers
    } else {
      toast.error('Failed to add printer.');
    }
  } catch (error) {
    console.error('Error adding printer:', error);
    toast.error('Failed to add printer.');
  }
};

export const addLocation = async (newLocation, fetchPrinters) => {
  try {
    const response = await fetch(`${API_URL}/api/locations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newLocation }),
    });
    if (response.ok) {
      toast.success('Location added successfully!');
      fetchPrinters(); // Refresh the list of printers to include the new location
    } else {
      toast.error('Failed to add location.');
    }
  } catch (error) {
    console.error('Error adding location:', error);
    toast.error('Failed to add location.');
  }
};