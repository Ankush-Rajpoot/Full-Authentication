import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import api from '../api.js'; 
import { AuthStore } from '../store/AuthStore';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';


const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate=useNavigate();
  const { signup, error, isLoading } =AuthStore();


  const signInWithGoogle = ()=>{
    window.open("http://localhost:5000/auth/google/callback","_self")
}

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
			await signup(fullName,username,email, password);
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <label htmlFor="userName">Username</label>
        <input
          type="text"
          id="userName"
          name="userName"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
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
        
        <PasswordStrengthMeter password={password} />
        <input type="submit" value="Submit" />
      </form>

      <p className="switch">
        Already have an account? <Link to="/login" className="switch-btn">Login</Link>
      </p>
      <button className='login-with-google-btn' onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  );
}
export default SignUp;
