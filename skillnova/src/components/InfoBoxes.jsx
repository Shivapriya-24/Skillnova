import React from 'react';
import styles from './InfoBoxes.module.css';

const infoBoxes = [
  { title: 'No Money Needed', description: 'All exchanges are value-based, not cash-based.' },
  { title: 'Flexible & Personalized', description: 'You choose the pace, the partner, and the schedule.' },
  { title: 'Learn By Doing', description: 'Hands-on experience is the best way to grow.' },
  { title: 'Supportive Community', description: 'Built on trust, encouragement, and accountability.' },
];

export default function InfoBoxes() {
  return (
    <section className={styles.infoBoxes}>
      <h2>Why Choose SkillNova?</h2>
      <div className={styles.grid}>
        {infoBoxes.map(({ title, description }) => (
          <div key={title} className={styles.card}>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
