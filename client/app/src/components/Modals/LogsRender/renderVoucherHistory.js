import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/LogsModal.css';

const RenderVoucherHistory = ({ vouchers, handleDeleteVoucher }) => {
  const sortedVouchers = [...vouchers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div>
      <h2>Voucher History</h2>
      <hr />
      <div className="voucher-history-table-container">
        <table className="voucher-history-table">
          <thead>
            <tr>
              <th className="grey-text">Code</th>
              <th className="blue-text">Status</th>
              <th className="blue-text">Created Date</th>
              <th className="blue-text">Created Time</th>
              <th className="green-text">QR Code</th>
              <th className="green-text">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedVouchers.map((voucher, index) => (
              <tr key={index}>
                <td className="grey-text">{voucher.discount_code}</td>
                <td className="blue-text">{voucher.is_used ? 'Used' : 'Unused'}</td>
                <td className="blue-text">{new Date(voucher.created_at).toLocaleDateString()}</td>
                <td className="blue-text">{new Date(voucher.created_at).toLocaleTimeString()}</td>
                <td className="green-text">
                  <QRCodeCanvas value={voucher.discount_code} />
                </td>
                <td className="green-text">
                  <button onClick={() => handleDeleteVoucher(voucher.discount_code)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderVoucherHistory;