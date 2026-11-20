import React from 'react';
import styles from './Features.module.css';

const features = [
  {
    icon: '🧑‍🎨',
    step: 'Step · 01',
    title: 'Sign Up & Create Your Profile',
    description: 'Create your free account and list the skills you offer and want to learn.',
  },
  {
    icon: '🧩',
    step: 'Step · 02',
    title: 'Get Matched',
    description: 'We connect you with users whose skills complement yours for a mutual swap.',
  },
  {
    icon: '❓',
    step: 'Step · 03',
    title: 'Chat & Set Terms',
    description: 'Message your match to agree on session details, format, and expectations.',
  },
  {
    icon: '🔄',
    step: 'Step · 04',
    title: 'Skill Swap in Action',
    description: 'Teach and learn in scheduled sessions, either online or in-person.',
  },
  {
    icon: '⭐',
    step: 'Step · 05',
    title: 'Leave a Review',
    description: 'Give feedback to build trust and improve future matches.',
  },
];

export default function Features() {
  return (
    <section className={styles.features} id="how-it-works">
      <h2>How SkillNova Works</h2>
      <div className={styles.grid}>
        {features.map(({ icon, step, title, description }, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{icon}</div>
            <p className={styles.step}>{step}</p>
            <h3>{title}</h3>
            <p className={styles.desc}>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
