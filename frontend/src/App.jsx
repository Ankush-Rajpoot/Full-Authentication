import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';    
import Lottie from 'lottie-react'; 
import bckgrnd from './assets/bckgrnd.json';
import Typewriter from './components/TypeWriter';
export default function App() {
  return (
    <Router>
      <div className="app">
      <div className="left-container">
        {/* <h2 className="typing-effect">Know Your Rights</h2> */}
        <Typewriter texts={["Your Rights", "The Laws", "The Rules"]} period={2000} />
        <Lottie animationData={bckgrnd} className="lottie-animation" /> {/* Render Lottie animation */}
      </div>
        
        <Routes>
          <Route path="/" element={<SignUp />} /> 
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
