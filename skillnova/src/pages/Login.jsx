import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import loginBg from '../assets/signup-bg.webp'; 

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const socialError = params.get('socialError');
    if (socialError) {
      alert(socialError);
      navigate('/login');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const email = form.email.trim();
  const password = form.password.trim();

  if (!validateEmail(email)) { 
    alert('Email must end with @gmail.com'); 
    return; 
  }
  if (!password) { 
    alert('Password required'); 
    return; 
  }

  try {
    const res = await fetch('http://localhost:5137/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 200) {
      const { role, email: userEmail, username } = data;
      const usernameToStore = username || userEmail.split('@')[0]
        .replace(/[0-9]/g, '')
        .replace(/[^a-zA-Z]/g, '')
        .replace(/^\w/, c => c.toUpperCase());

      localStorage.setItem('username', usernameToStore);
      localStorage.setItem('role', role);
      localStorage.setItem('userEmail', userEmail);

      alert('Login successful!');
      navigate('/Dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error. Try again later.');
  }
};

  const handleGoogleLogin = () => window.location.href = 'http://localhost:5137/api/auth/google?action=login';
  const handleLinkedinLogin = () => window.location.href = 'http://localhost:5137/api/auth/linkedin?action=login';
  const handleGithubLogin = () => window.location.href ='http://localhost:5137/api/auth/github?action=login';
  return (
    <div className={styles.container}>
      <div className={styles.leftPane} style={{ backgroundImage: `url(${loginBg})` }}>
        <h1>Learn anything,<br />Teach everything.</h1>
        <p>SkillSwap Connect: Your gateway to endless skills and personal growth.</p>
        <strong>Log in now!</strong>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input type="email" name="email" placeholder="you@gmail.com" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

        <button type="submit" className={styles.loginBtn}>LOG IN</button>

        <p className={styles.signupText}>
          New user? <span onClick={() => navigate('/signup')}>Sign up here</span>
        </p>
        <p className={styles.forgotPassword}>
          Forgot password? <span onClick={() => navigate('/forgot-password')}>Reset here</span>
        </p>

        <div className={styles.divider}>or login with</div>
        <div className={styles.socialIcons}>
          <img src="/icons/google.png" alt="Google" onClick={handleGoogleLogin} />
          <img src="/icons/linkedin.png" alt="Linkedin" onClick={handleLinkedinLogin} />
          <img src="/icons/github.png" alt="github" onClick={handleGithubLogin} />
        </div>
      </form>
    </div>
  );
}
