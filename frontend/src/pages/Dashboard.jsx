import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthStore } from '../store/AuthStore';

const Dashboard = () => {
  const { user, isAuthenticated, checkAuth, logout } = AuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await checkAuth(); // Fetch user details after login or signup
      if (!isAuthenticated) {
        navigate('/login');
      }
    };
    fetchData();
  }, [isAuthenticated, navigate, checkAuth]); // Ensure checkAuth is called on load

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="form-container">
      <h2>Dashboard</h2>
      {user ? (
        <>
          <p>Welcome, {user.fullName || user.email}!</p>
          <p>Email: {user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
