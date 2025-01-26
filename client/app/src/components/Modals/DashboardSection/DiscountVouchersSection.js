import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './styles/DiscountVouchersSection.css'; // Import the CSS file for styling

const API_URL = process.env.REACT_APP_API_BASE_URL;

function DiscountVouchersSection({ userId }) {
  const [discountVouchers, setDiscountVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountVouchers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/discount_vouchers/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          const userVouchers = data.filter(voucher => voucher.students.includes(userId));
          setDiscountVouchers(userVouchers);
        } else {
          console.error('Failed to fetch discount vouchers:', data);
        }
      } catch (error) {
        console.error('Error fetching discount vouchers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountVouchers();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="voucher-dashboard-section">
      <h3>Discount Vouchers</h3>
      <div className="voucher-container">
        {discountVouchers.map(voucher => (
          <div key={voucher.id} className="voucher-item">
            <QRCodeCanvas value={voucher.discount_code} size={64} />
            <div className="voucher-details">
              <p><strong>Code:</strong> {voucher.discount_code}</p>
              <p><strong>Amount:</strong> P{voucher.discount_amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiscountVouchersSection;