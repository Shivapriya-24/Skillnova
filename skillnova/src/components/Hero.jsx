import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import handshakeImg from '../assets/handshake.jpg'; 

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h1>Trade Your Talents.<br />Learn Something New.</h1>
        <p>
          SkillNova connects people who want to grow by exchanging skills — no cash, just collaboration.
        </p>
        <Link to="/welcome" className={styles.btnSecondary}>
          Explore Skill Swaps
        </Link>
      </div>
      <div className={styles.heroImage}>
        <img src={handshakeImg} alt="Handshake" />
      </div>
    </section>
  );
}
