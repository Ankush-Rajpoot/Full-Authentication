import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Profile from './components/Profile';
import Lottie from 'lottie-react';
import bckgrnd from './assets/bckgrnd.json';
import Typewriter from './components/TypeWriter';

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
        <Route path="/profile" element={<Profile />} />
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
