import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'admin@skillnova.com';
const ADMIN_PASSWORD = 'Admin@123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      alert('✅ Admin login successful!');
      localStorage.setItem('adminEmail', ADMIN_EMAIL);
      navigate('/admin-dashboard');
    } else {
      alert('❌ Invalid admin credentials!');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '400px', margin: 'auto' }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
}
