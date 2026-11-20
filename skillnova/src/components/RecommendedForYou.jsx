import React from 'react';
import styles from '../styles/RecommendedForYou.module.css';

const recommendationsData = {
  learner: [
    { title: 'Violin Basics', description: 'Start playing violin with simple lessons' },
    { title: 'Conversational French', description: 'Learn to speak French confidently' },
  ],
  teacher: [
    { title: 'Create Your First Course', description: 'Step-by-step guide to course creation' },
    { title: 'Find Learners', description: 'Tips to grow your student base' },
  ],
  admin: [
    { title: 'Manage Platform', description: 'Admin tools and analytics' },
    { title: 'User Support', description: 'Help your users effectively' },
  ],
};

export default function RecommendedForYou({ role }) {
  const recommendations = recommendationsData[role] || recommendationsData.learner;

  return (
    <div className={styles.recommendedContainer}>
      <h2 className={styles.heading}>🎖️ Recommended for You</h2>
      <div className={styles.cards}>
        {recommendations.map(({ title, description }, idx) => (
          <div key={idx} className={styles.card}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
