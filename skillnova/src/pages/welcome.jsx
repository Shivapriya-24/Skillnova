import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';
import handshakeImg from '../assets/handshake.jpg'; 

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.card}>
        <img src={handshakeImg} alt="Handshake" className={styles.image} />
        <h2>Welcome</h2>
        <p>
          To <span className={styles.brand}>SkillSwapHub</span>.
        </p>
        <p className={styles.description}>
          Where skill gets <strong>there</strong> perfect meaning. The platform's intuitive matching algorithm suggests potential skill swaps based on user preferences and proficiency levels.
        </p>
        <div className={styles.buttons}>
          <button onClick={() => navigate('/')} className={styles.skipBtn}>Skip</button>
          <button onClick={() => navigate('/communicate')} className={styles.nextBtn}>Next &rarr;</button>
        </div>
      </div>
    </div>
  );
}
