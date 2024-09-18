import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="form-container">
      <h2>Login</h2>      
      <form>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />

        <input type="submit" value="Login" />
      </form>
      <p class="switch">Don't have an account? <Link to="/" class="switch-btn">Sign Up</Link></p>
    </div>
  );
}

export default Login;
