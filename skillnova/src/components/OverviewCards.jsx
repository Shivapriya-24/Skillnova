import React, { useEffect, useState } from 'react';
import styles from '../styles/OverviewCards.module.css';
import { useNavigate } from 'react-router-dom';

import LearnerPanel from './LearnerPanel';
import AdminPanel from './AdminPanel';
import TeacherPanel from './TeacherPanel';

export default function OverviewCards() {
  const navigate = useNavigate();

  const handleCoreFeaturesClick = () => {
    navigate('/core-features');
  };
  const [role, setRole] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const [showCoreFeatures, setShowCoreFeatures] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const response = await fetch(`http://localhost:5137/api/userinfo?email=${email}`);
        const data = await response.json();

        if (response.ok && data.role) {
          setRole(data.role);
        } else {
          console.warn('No role found for user.');
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };

    fetchRole();
  }, []);

  const handleToggleTools = () => {
    setShowTools(prev => !prev);
    if (showCoreFeatures) setShowCoreFeatures(false);
  };

  const handleToggleCoreFeatures = () => {
    setShowCoreFeatures(prev => !prev);
    if (showTools) setShowTools(false);
  };

  const renderRolePanel = () => {
    if (!showTools) return null;

    if (role === 'learner') return <LearnerPanel />;
    if (role === 'admin') return <AdminPanel />;
    if (role === 'teacher') return <TeacherPanel />;

    return null;
  };

  return (
    <div className={styles.cards}>
      {/* Role Card */}
      <div
        className={styles.card}
        onClick={handleToggleTools}
        style={{ cursor: role ? 'pointer' : 'default' }}
      >
        <div className={styles.icon}>
          {role === 'admin' && '👩‍💼'}
          {role === 'teacher' && '👨‍🏫'}
          {role === 'learner' && '🧑‍🎓'}
          {!role && '🧑‍💼'}
        </div>
        <div>
          <h3>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Loading...'}</h3>
          <div style={{ marginTop: '1rem' }}>
            {renderRolePanel()}
          </div>
        </div>
      </div>

      {/* Skills Offered Card */}
      <div className={styles.card}
        onClick={() => navigate('/skills-offered')}
        style={{ cursor: 'pointer' }}
      >
        
        <div className={styles.icon}>🛠️</div>
        <h3>Skills Offered</h3>
      </div>

      {/* Ongoing Swaps Card */}
      <div className={styles.card}>
        <div className={styles.icon}>🔁</div>
        <h3>Ongoing Swaps</h3>
      </div>

      {/* Core Features Card */}
      <div
        className={styles.card}
        onClick={handleCoreFeaturesClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.icon}>💡</div>
        <h3>Core Features</h3>
      </div>
    </div>
  );
}
