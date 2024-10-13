import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Your API service

const Logout = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      // Call the API to log out the user
      await api.post('/users/logout',{},{
        withCredentials:true,
      });
      alert('Logged out successfully!');
      // Clear any local storage or tokens if needed here
      navigate('/login'); // Redirect to login page
    }
    catch (error) {
      console.error('Error logging out', error);
      alert('Error logging out');
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
