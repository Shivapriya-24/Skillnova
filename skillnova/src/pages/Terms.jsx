import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPage.css';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <div className="info-card">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <h1>Terms & Conditions</h1>
        <p>
          By using SkillNova, you agree to abide by these terms.
          The platform facilitates skill exchange between users but does not guarantee outcomes of sessions.
        </p>

        <h2>User Responsibilities</h2>
        <ul>
          <li>Provide accurate profile information and maintain respectful communication.</li>
          <li>Comply with local laws and avoid harassment or discrimination.</li>
          <li>Understand that SkillNova is not liable for agreements made outside the platform.</li>
        </ul>

        <p>
          For questions or policy clarifications, contact us at
          <a href="mailto:support@skillnova.com"> support@skillnova.com</a>.
        </p>
      </div>
    </div>
  );
}
