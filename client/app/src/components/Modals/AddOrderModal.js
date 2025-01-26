import React, { useState, useContext, useEffect } from 'react';
import './styles/AddOrderModal.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../../context/UserContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { fetchUserData, fetchDiscountVouchers, updateUserFreePrinting, calculateTotalPrice, 
  handleSubmit, confirmSubmit, handleFileChange } from '../../utils/orderUtils';
import questionIcon from '../../assets/questionIcon.png';
import pricesOffered from '../../assets/pricesOffered.png';
import ImageModal from './ImageModal';
import FileUploadSection from '../Sections/FileUploadSection';
import PrinterSelectionSection from '../Sections/PrinterSelectionSection';
import PaymentSection from '../Sections/PaymentSection';
import { Cloudinary } from 'cloudinary-core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../utils/firebaseUtils';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const cloudinary = new Cloudinary({ cloud_name: 'djgtuj9zv', secure: true });

function AddOrderModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [size, setSize] = useState('A4');
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(0);
  const [colorOption, setColorOption] = useState('Black and White');
  const [type, setType] = useState('Text Only');
  const [totalPrice, setTotalPrice] = useState(30.00);
  const [paymentOption, setPaymentOption] = useState('Gcash');
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [pickUpDateTime, setPickUpDateTime] = useState('');
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showLocationSection, setShowLocationSection] = useState(false);
  const { userEmail, isFreePrintingAvailed, setIsFreePrintingAvailed, trailpayPoints, setTrailpayPoints, idNumber, name } = useContext(UserContext); // Remove id from destructuring
  const [userId, setUserId] = useState(null); // Add userId state
  const [userName, setUserName] = useState('');
  const [discountVouchers, setDiscountVouchers] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [discountVoucherId, setDiscountVoucherId] = useState(null);
  const [isFreePrintingUsed, setIsFreePrintingUsed] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [printers, setPrinters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [supply, setSupply] = useState(null);
  const [printerStatus, setPrinterStatus] = useState('active'); // Add printerStatus state

  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchUserData(userEmail, setUserName, setIsFreePrintingAvailed, setTotalPrice, setTrailpayPoints);
      if (userData) {
        setIsFreePrintingAvailed(userData.isFreePrintingAvailed); // Set the state based on the response
        setIsFreePrintingUsed(userData.isFreePrintingUsed); // Set the state based on the response
      }
    };
    fetchData();
    fetchDiscountVouchers(setDiscountVouchers);
  }, [userEmail, setIsFreePrintingAvailed, setIsFreePrintingUsed, setTrailpayPoints]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userResponse = await fetch(`${API_URL}/api/users/email/?email=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const userData = await userResponse.json();
        setUserId(userData.id); // Set the userId state
        console.log('Fetched user ID:', userData.id); // Log the fetched user ID
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [userEmail]);

  useEffect(() => {
    const calculatedTotalPrice = calculateTotalPrice(pages, copies, colorOption, type);
    setTotalPrice(calculatedTotalPrice);
  }, [pages, copies, colorOption, type]);

  useEffect(() => {
    if (colorOption === 'Black and White') {
      setType('Text Only');
    } else if (colorOption === 'Colored') {
      setType('Text with Images');
    }
  }, [colorOption]);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`${API_URL}/api/printers/`);
        const data = await response.json();
        setPrinters(data);
        const uniqueLocations = [...new Set(data.map(printer => printer.location))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching printers:', error);
      }
    };

    fetchPrinters();
  }, []);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await fetch(`${API_URL}/api/supply/`);
        const data = await response.json();
        console.log(data);
        setSupply(data);
      } catch (error) {
        console.error('Error fetching supply data:', error);
      }
    };

    fetchSupply();
  }, []);

  const handleNext = async (e) => {
    e.preventDefault();

    if (!file || !size || !pages || !copies || !colorOption || !type) {
      toast.error('Please fill all fields.');
      return;
    }

    if (!showLocationSection) {
      setShowLocationSection(true);
    } else if (!selectedPrinter) {
      toast.error('Please select a printer.');
    } else {
      if (printerStatus !== 'active') {
        toast.error('Cannot proceed with an inactive printer. Please select an active printer.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/supply/printer/${encodeURIComponent(selectedLocation)}/`);
        const data = await response.json();

        if (!data || data.a4_supplies < pages * copies || data.letter_supplies < pages * copies || data.legal_supplies < pages * copies) {
          toast.error('One or more supplies are out of stock.');
          return;
        }

        setShowLocationSection(false);
        setShowPaymentSection(true);
      } catch (error) {
        console.error('Error fetching supply data:', error);
        toast.error('Error fetching supply data.');
      }
    }
  };

  const isNextDisabled = !file || !size || !pages || !copies || !colorOption || !type || (showLocationSection && (!selectedLocation || !selectedPrinter || printerStatus !== 'active'));

  const handleSubmitOrder = async () => {
    if (!supply) {
      toast.error('Supply data not loaded yet.');
      return;
    }

    if (supply.a4_supplies === 0 || supply.letter_supplies === 0 || supply.legal_supplies === 0) {
      toast.error('One or more supplies are out of stock.');
      return;
    }

    const formData = new FormData();
    formData.append('user_name', userName);
    formData.append('email', userEmail);
    formData.append('document_name', file.name);
    formData.append('document_type', size);
    formData.append('pages', pages);
    formData.append('copies', copies);
    formData.append('print_type', colorOption);
    formData.append('type', type);
    formData.append('original_price', totalPrice);
    formData.append('total_price', totalPrice);
    formData.append('date_time', new Date().toISOString());
    formData.append('pick_up_time_date', new Date(new Date(pickUpDateTime).getTime() + 8 * 60 * 60 * 1000).toISOString());
    formData.append('status', 'Pending');
    formData.append('availed_free_printing', !isFreePrintingAvailed);
    formData.append('payment_method', paymentOption);
    
    if (proofOfPayment) {
      const formDataForCloudinary = new FormData();
      formDataForCloudinary.append('file', proofOfPayment);
      formDataForCloudinary.append('upload_preset', 'trailink');

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/djgtuj9zv/image/upload`, {
        method: 'POST',
        body: formDataForCloudinary,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Cloudinary upload error! status: ${uploadResponse.status}, message: ${errorText}`);
      }

      const data = await uploadResponse.json();
      const paymentImageUrl = data.secure_url;
      formData.append('payment_image', paymentImageUrl);
    }

    formData.append('ref_number', referenceNumber);
    formData.append('printer_name', selectedPrinter);
    formData.append('printer_location', selectedLocation);

    // Upload document to Firebase
    const fileRef = ref(storage, `documents/${file.name}`);
    await uploadBytes(fileRef, file);
    const documentUrl = await getDownloadURL(fileRef);
    formData.append('document_url', documentUrl);

    console.log('Form Data:', Object.fromEntries(formData.entries())); // Log form data to verify

    handleSubmit(formData, userEmail, updateUserFreePrinting, onClose, discountVoucherId, referenceNumber);

    const logData = {
      date_time: new Date().toISOString(),
      name: name,
      id_number: idNumber,
      activity: 'Submitted an order',
      role: 'student',
    };
    await fetch(`${API_URL}/api/logs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
  };

  const getTypeOptions = () => {
    if (colorOption === 'Black and White') {
      return (
        <>
          <option value="Text Only">Text Only</option>
          <option value="Text with Images">Text with Images</option>
          <option value="Images Only">Images Only</option>
          <option value="Images with Small Text">Images with Small Text</option>
        </>
      );
    } else if (colorOption === 'Colored') {
      return (
        <>
          <option value="Text with Images">Text with Images</option>
          <option value="Images Only">Images Only</option>
          <option value="Images with Small Text">Images with Small Text</option>
        </>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-order-modal">
      <ToastContainer />
      <h2>
        Add Order
        <div className="question-icon-container">
          <img
            src={questionIcon}
            alt="Question Icon"
            className="question-icon"
            onClick={() => setIsImageModalOpen(true)}
          />
          <div className="tooltip">Prices Offered</div>
        </div>
      </h2>
      <form onSubmit={showPaymentSection ? (e) => confirmSubmit(e, handleSubmitOrder) : handleNext}>
        {!showPaymentSection && !showLocationSection && (
          <FileUploadSection
            file={file}
            setFile={setFile}
            size={size}
            setSize={setSize}
            pages={pages}
            setPages={setPages}
            copies={copies}
            setCopies={setCopies}
            colorOption={colorOption}
            setColorOption={setColorOption}
            type={type}
            setType={setType}
            getTypeOptions={getTypeOptions}
            discountVouchers={discountVouchers}
            totalPrice={totalPrice}
            setTotalPrice={setTotalPrice}
            setDiscountVoucherId={setDiscountVoucherId}
            studentId={userId} // Pass userId as a prop
          />
        )}
        {showLocationSection && (
          <PrinterSelectionSection
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            locations={locations}
            selectedPrinter={selectedPrinter}
            setSelectedPrinter={setSelectedPrinter}
            printers={printers}
            setPrinterStatus={setPrinterStatus} // Pass setPrinterStatus as a prop
          />
        )}
        {showPaymentSection && (
          <PaymentSection
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            trailpayPoints={trailpayPoints}
            proofOfPayment={proofOfPayment}
            setProofOfPayment={setProofOfPayment}
            proofOfPaymentPreview={proofOfPaymentPreview}
            setProofOfPaymentPreview={setProofOfPaymentPreview}
            referenceNumber={referenceNumber}
            setReferenceNumber={setReferenceNumber}
            pickUpDateTime={pickUpDateTime}
            setPickUpDateTime={setPickUpDateTime}
            handleFileChange={handleFileChange}
            totalPrice={totalPrice} // Pass totalPrice as a prop
          />
        )}
        <button type="submit" className="add-submit-button" disabled={isNextDisabled}>{showPaymentSection ? 'Submit' : 'Next'}</button>
      </form>
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageSrc={pricesOffered}
      />
    </div>
  );
}

export default AddOrderModal;