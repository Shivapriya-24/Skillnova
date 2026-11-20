import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email');
    
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5137/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      alert(data.message);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Server error. Try again later.');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
