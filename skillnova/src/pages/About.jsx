import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InfoPage.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <div className="info-card">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <h1>About SkillNova</h1>
        <p>
          SkillNova is a global platform that empowers people to learn and teach skills through peer-to-peer sessions.
          Whether you’re mastering coding, music, design, or career development,
          our mission is to make knowledge exchange seamless and inspiring.
        </p>
        <p>
          Founded by lifelong learners, SkillNova focuses on collaboration and community.
          Our secure scheduling, feedback, and certificate features ensure a professional yet friendly experience.
        </p>
        <h2>Our Core Values</h2>
        <ul>
          <li><strong>Openness:</strong> Learning should be accessible to everyone.</li>
          <li><strong>Collaboration:</strong> We grow faster when we grow together.</li>
          <li><strong>Integrity:</strong> Privacy and respect are non-negotiable.</li>
        </ul>
      </div>
    </div>
  );
}
