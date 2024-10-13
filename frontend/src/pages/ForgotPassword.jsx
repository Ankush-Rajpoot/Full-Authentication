import React, { useState } from 'react';
import { AuthStore } from '../store/AuthStore.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading, error, message } = AuthStore();
  const [submitted, setSubmitted] = useState(false); // State to track form submission

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setSubmitted(true); // Set submitted to true after form submission
  };

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>
      {!submitted ? (
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
          <input type="submit" value="Submit" disabled={isLoading} />
        </form>
      ) : (
        <p>
          {`If an account exists for ${email}, you will receive a password reset link shortly.`}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
