import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar({role}) {
  const navigate = useNavigate();

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>SkillNova</h2>
      <ul className={styles.navList}>
        <li onClick={() => navigate('/dashboard')}>🏠 Dashboard</li>
        <li onClick={() => navigate('/dashboard/skills')}>🛠️ Skills</li>
        <li onClick={() => navigate('/dashboard/sessions')}>📅 Sessions</li>
        <li onClick={() => navigate('/dashboard/messages')}>💬 Messages</li>
        <li onClick={() => navigate('/dashboard/achievements')}>🏆 Achievements</li>
        <li onClick={() => navigate('/dashboard/collaboration')}>🤝 Collaboration</li>
        <li onClick={() => navigate('/dashboard/notifications')}>🔔 Notifications</li>
        <li onClick={() => navigate('/dashboard/feedback')}>🗣️ Feedback</li>
        <li onClick={() => navigate('/dashboard/settings')}>⚙️ Settings</li>
        <li onClick={() => {
          localStorage.clear();
          navigate('/login');
        }}>🚪 Logout</li>
      </ul>
    </div>
  );
}
