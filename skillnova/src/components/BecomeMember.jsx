import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BecomeMember.module.css';

export default function BecomeMember() {
  return (
    <section id="become-a-member" className={styles.becomeMember}>
      <div className={styles.container}>
        <h2>Become a SkillNova Member</h2>
        <p className={styles.subtitle}>
          Join a global network of learners and teachers. Trade your talents,
          discover new passions, and grow—absolutely free.
        </p>

        <div className={styles.benefits}>
          <div className={styles.card}>
            <h3>👩‍🏫 Teach & Learn</h3>
            <p>Offer your skills while learning something new from others.</p>
          </div>
          <div className={styles.card}>
            <h3>🤝 Connect Worldwide</h3>
            <p>Meet people who share your interests across the globe.</p>
          </div>
          <div className={styles.card}>
            <h3>🎯 Verified Certificates</h3>
            <p>Earn SkillNova certificates to showcase your achievements.</p>
          </div>
        </div>

        <Link to="/signup" className={styles.joinBtn}>
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
