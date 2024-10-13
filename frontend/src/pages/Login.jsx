import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Import your API service
import { AuthStore } from '../store/AuthStore';

const Login = () => {
  // State for form fields
  const { login } = AuthStore(); // Access the login function from AuthStore
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const signInWithGoogle = ()=>{
    window.open("http://localhost:5000/auth/google/callback","_self")
}

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // Use the login function from AuthStore
      navigate('/dashboard'); // Redirect after login
    } catch (err) {
      console.error(err);
      alert('Error logging in.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>      
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input type="submit" value="Login" />
        <Link to='/forgot-password'>Forgot Password</Link>
      </form>
      <p className="switch">
        Don't have an account? <Link to="/" className="switch-btn">Sign Up</Link>
      </p>
      <button className='login-with-google-btn' onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  );
};

export default Login;
