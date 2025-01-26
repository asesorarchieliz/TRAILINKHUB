import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './screens/Login';
import Header from './components/Header';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import ForgetPassword from './screens/ForgetPassword';
import AdminLogin from './screens/Admin';
import ChangePassword from './screens/ChangePassword';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/12admin12" element={<AdminLogin />} />
          <Route path="/reset-password/:uid/:token" element={<ChangePassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;