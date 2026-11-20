import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css';
import signupBg from '../assets/signup-bg.webp';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin-login');
  };
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    role: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9]+@gmail\.com$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      alert('Username is required');
      return;
    }

    if (!validateEmail(form.email.trim())) {
      alert('Email must be valid and end with @gmail.com');
      return;
    }

    if (!form.role) {
      alert('Please select a role');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!form.agreeToTerms) {
      alert('You must agree to the terms');
      return;
    }

    try {
      const response = await fetch('http://localhost:5137/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        localStorage.setItem('username', form.username.trim());
        localStorage.setItem('userEmail',form.email.trim());
        alert('Signup successful!');
        setForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false,
          role: '',
        });
        navigate('/Dashboard');
      } else if (response.status === 409) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Server error. Try again later.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5137/api/auth/google?action=signup';
  };

  const handleLinkedinLogin = () => {
    window.location.href = 'http://localhost:5137/api/auth/linkedin?action=signup';
  };
  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:5137/api/auth/github?action=signup';
  };


  return (
    <div className={styles.container}>
      <div
        className={styles.leftPane}
        style={{ backgroundImage: `url(${signupBg})` }}
      >
        <h1>Learn anything,<br />Teach everything.</h1>
        <p>SkillSwap Connect: Your gateway to endless skills and personal growth.</p>
        <strong>Sign up now!</strong>
        
      </div>


      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="you@gmail.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        {/* Role selector */}
        <label htmlFor="role" style={{ marginTop: '10px' }}>Select your role:</label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          required
          style={{ marginBottom: '20px', padding: '8px', fontSize: '1rem' }}
        >
          <option value="" disabled>
            -- Select your role --
          </option>
          <option value="learner">Learner</option>
          <option value="teacher">Teacher</option>
          <option value="both">Learner & Teacher</option>
        </select>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={form.agreeToTerms}
            onChange={handleChange}
          />
          I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </label>
        <button type="submit" className={styles.signupBtn}>SIGN UP</button>

        <div className={styles.divider}>or Sign up with</div>
        <div className={styles.socialIcons}>
          <img src="/icons/google.png" alt="Google" onClick={handleGoogleLogin} style={{ cursor: 'pointer' }} />
          <img src="/icons/linkedin.png" alt="Linkedin" onClick={handleLinkedinLogin} style={{ cursor: 'pointer' }} />
          <img src="/icons/github.png" alt="github" onClick={handleGithubLogin} style={{ cursor: 'pointer' }} />
        </div>
        <div
          onClick={handleAdminClick}
          style={{ cursor: 'pointer', marginTop: '20px', fontSize: '2rem' ,textAlign:'center'}}
          title="Admin Login"
        >
          Admin 👑 
        </div>
        <p className={styles.loginText}>
          Already have an account? <span onClick={() => navigate('/login')}>Log in</span>
        </p>
      </form>
    </div>
  );
}
