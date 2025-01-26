import React from 'react';
import './styles/PDFViewer.css';

const PDFViewer = ({ pdfUrl, onClose }) => {
  return (
    <div className="pdf-viewer-modal">
      <button className="modal-close" onClick={onClose}>
        Close
      </button>
      <iframe src={pdfUrl} width="100%" height="100%" title="PDF Viewer"></iframe>
    </div>
  );
};

export default PDFViewer;