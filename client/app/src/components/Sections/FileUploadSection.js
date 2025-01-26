import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { analyzePdf } from '../../utils/pdfAnalyzerUtils';
import { calculateTotalPrice } from '../../utils/orderUtils';
import jsQR from 'jsqr';

const API_URL = process.env.REACT_APP_API_BASE_URL;

function FileUploadSection({
  file,
  setFile,
  size,
  setSize,
  pages,
  setPages,
  copies,
  setCopies,
  colorOption,
  setColorOption,
  type,
  setType,
  getTypeOptions,
  discountVouchers,
  totalPrice,
  setTotalPrice,
  setDiscountVoucherId,
  studentId // Add studentId as a prop
}) {
  const [supply, setSupply] = useState(null);
  const [fileName, setFileName] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0); // Add state for discount amount

  useEffect(() => {
    console.log('Calculating total price with:', { pages, copies, colorOption, type, discountAmount });
    const total = calculateTotalPrice(pages, copies, colorOption, type);
    const discountedTotal = Math.max(0, total - discountAmount);
    console.log('Calculated total price:', discountedTotal);
    setTotalPrice(discountedTotal);
  }, [pages, copies, colorOption, type, discountAmount, setTotalPrice]);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await fetch(`${API_URL}/api/supply/`);
        const data = await response.json();
        setSupply(data);
        console.log('Supply data fetched:', data); // Log supply data
      } catch (error) {
        console.error('Error fetching supply data:', error);
      }
    };

    fetchSupply();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Analyze the PDF file
      try {
        const result = await analyzePdf(selectedFile);
        setPages(result.totalPages);
        if (result.pagesWithImages > 0) {
          setType('Text with Images');
        } else {
          setType('Text Only');
        }
        toast.success(`PDF analyzed: ${result.totalPages} pages, ${result.textOnlyPages} text-only pages, ${result.pagesWithImages} pages with images.`);
      } catch (error) {
        console.error('Error analyzing PDF:', error);
        toast.error('Error analyzing PDF.');
      }
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const handleQRFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          const discountCode = code.data;
          console.log('QR code data:', discountCode); // Log QR code data
          applyDiscountCode(discountCode, discountVouchers, setDiscountVoucherId, studentId, setDiscountAmount);
        } else {
          toast.error('No QR code found in the image.');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const applyDiscountCode = (discountCode, discountVouchers, setDiscountVoucherId, studentId, setDiscountAmount) => {
    console.log('Applying discount code:', discountCode); // Log discount code
    const voucher = discountVouchers.find(voucher => voucher.discount_code === discountCode);
    console.log('Found voucher:', voucher); // Log found voucher
    if (voucher) {
      console.log('Voucher is not used:', !voucher.is_used); // Log voucher usage status
      console.log('Voucher is valid for student:', voucher.students.includes(studentId)); // Log student validity
      console.log('Voucher students:', voucher.students); // Log voucher students
      console.log('Current student ID:', studentId); // Log current student ID
    }
    if (voucher && !voucher.is_used && voucher.students.includes(studentId)) {
      setDiscountVoucherId(voucher.id); // Store the voucher ID
      setDiscountAmount(parseFloat(voucher.discount_amount)); // Store the discount amount
      console.log('Discount amount set to:', voucher.discount_amount);
      toast.success(`Discount applied: ${voucher.discount_amount} PHP`);
    } else {
      toast.error('Expired, used, invalid discount code, or not valid for this student.');
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };

  const handleQRUploadClick = () => {
    document.getElementById('qr-file-input').click();
  };

  return (
    <>
      <div className="add-modal-form-group">
        <label>Upload Document (PDF only):</label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          id="file-input"
          className="file-input"
          required 
        />
        <button type="button" onClick={handleUploadClick}>
          {fileName ? fileName : 'Choose File'}
        </button>
      </div>
      <div className="add-modal-form-group">
        <label>Size:</label>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
        </select>
      </div>
      <div className="add-modal-form-group">
        <label>Pages:</label>
        <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} min="1" required />
      </div>
      <div className="add-modal-form-group">
        <label>Copies:</label>
        <input type="number" value={copies} onChange={(e) => setCopies(e.target.value)} min="1" required />
      </div>
      <div className="add-modal-form-group">
        <label>Color Option:</label>
        <select value={colorOption} onChange={(e) => setColorOption(e.target.value)}>
          <option value="Colored">Colored</option>
          <option value="Black and White">Black and White</option>
        </select>
      </div>
      <div className="add-modal-form-group">
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {getTypeOptions()}
        </select>
      </div>
      <div className="add-modal-form-group">
        <label>Upload QR Discount (Optional):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleQRFileChange} 
          id="qr-file-input"
          className="file-input"
        />
        <button type="button" onClick={handleQRUploadClick}>Choose QR File</button>
      </div>
      <div className="add-modal-form-group">
        <label>Your Total:</label>
        <div>{totalPrice} PHP</div>
      </div>
    </>
  );
}

export default FileUploadSection;