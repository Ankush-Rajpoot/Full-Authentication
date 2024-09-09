import React from 'react';

const DarkForm = () => {
  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />

        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <DarkForm />
    </div>
  );
}
