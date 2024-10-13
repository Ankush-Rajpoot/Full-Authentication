import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthStore } from '../store/AuthStore';
import { useNavigate } from 'react-router-dom';


const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const { resetPassword, isLoading, error, message } = AuthStore();
  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(token, password);
    setTimeout(() => {
        navigate("/login");
    }, 2000);
  };

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">New Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input type="submit" value="Reset" disabled={isLoading} />
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: '#6200ea' }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;
