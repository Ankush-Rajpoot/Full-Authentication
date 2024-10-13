import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Lottie from 'lottie-react';
import bckgrnd from './assets/bckgrnd.json';
import background from './assets/background.json'
import Typewriter from './pages/TypeWriter';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';



const Layout = () => {
  const location = useLocation(); // Use location hook inside Router
  const showAnimationAndTypewriter = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="app">
      {showAnimationAndTypewriter && (
        <div className="left-container">
          <Typewriter texts={["Your Rights", "The Laws", "The Rules"]} period={2000} />
          <Lottie animationData={bckgrnd} className="lottie-animation" />
        </div>
      )}
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Layout /> {/* Wrap Layout inside Router */}
    </Router>
  );
}
