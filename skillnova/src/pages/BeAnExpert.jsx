import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';
import expertImg from '../assets/expert.jpg';

export default function BeAnExpert() {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.card}>
        <img src={expertImg} alt="Expert" className={styles.image} />
        <h2>Be an Expert</h2>
        <p>
          While swapping your skills in <span className={styles.brand}>SkillSwapHub</span>.
        </p>
        <p className={styles.description}>
          Experience different perspectives and cultural influences as you exchange skills with a diverse group of learners.
        </p>
        <div className={styles.buttons} style={{ justifyContent: 'center' }}>
          <button onClick={() => navigate('/signup')} className={styles.nextBtn}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
