import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPage.css';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <div className="info-card">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <h1>Contact Us</h1>
        <p>We’d love to hear from you. Choose the method that works best:</p>
        <ul>
          <li>Email: <a href="mailto:support@skillnova.com">support@skillnova.com</a></li>
          <li>Discord: <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer">Community Server</a></li>
          <li>GitHub: <a href="https://github.com/YourOrg" target="_blank" rel="noopener noreferrer">Open Source Projects</a></li>
          <li>Twitter: <a href="https://twitter.com/skillnova" target="_blank" rel="noopener noreferrer">@skillnova</a></li>
        </ul>
        <p>Our support team typically responds within 24 hours on business days.</p>
      </div>
    </div>
  );
}
