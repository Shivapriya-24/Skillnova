import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/ResetPassword.module.css'; 

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    const e = params.get('email');

    if (!t || !e) {
      alert('Invalid password reset link.');
      navigate('/login');
    } else {
      setToken(t);
      setEmail(e);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) return alert('Please fill all fields');
    if (password !== confirmPassword) return alert('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5137/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();

      if (res.status === 200) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message || 'Reset failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <input
          type="email"
          value={email}
          disabled
          placeholder="Email"
          className={styles.input}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          className={styles.input}
          required
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className={styles.input}
          required
        />

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
