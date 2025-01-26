import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserProvider } from './context/UserContext'; // Import the UserProvider

// Ensure you only call createRoot once
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Use root.render to update the content
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);