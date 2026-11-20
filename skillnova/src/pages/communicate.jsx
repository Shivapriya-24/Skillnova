import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';
import communicateImg from '../assets/communicate.jpg'; 

export default function Communicate() {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.card}>
        <img src={communicateImg} alt="Communication" className={styles.image} />
        <h2>Communicate</h2>
        <p>
          With experts in <span className={styles.brand}>SkillSwapHub</span>.
        </p>
        <p className={styles.description}>
          Explore a wide range of topics and skills offered by other users. From programming and design to cooking and language learning, SkillSwapHub accommodates a broad spectrum of interests.
        </p>
        <div className={styles.buttons}>
          <button onClick={() => navigate('/')} className={styles.skipBtn}>Skip</button>
          <button onClick={() => navigate('/be-an-expert')} className={styles.nextBtn}>
  Next →
</button>

        </div>
      </div>
    </div>
  );
}
