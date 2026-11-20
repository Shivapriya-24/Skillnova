import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPage.css';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <div className="info-card">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is our priority. We collect minimal personal data—name, email,
          and skill preferences—to operate the platform effectively.
        </p>

        <h2>Data Usage</h2>
        <ul>
          <li>Your data is used only to match learners and teachers and to issue certificates.</li>
          <li>We never sell or share your personal information with third parties.</li>
        </ul>

        <p>
          You may request deletion of your account and data at any time by emailing
          <a href="mailto:privacy@skillnova.com"> privacy@skillnova.com</a>.
        </p>
      </div>
    </div>
  );
}
