import React from 'react';
import styles from '../styles/CoreFeatures.module.css';

export default function CoreFeatures() {
  const features = [
    {
      title: 'Skill Swapping System',
      description: 'Connect with peers to exchange knowledge and skills in real-time.',
      icon: '🔄',
    },
    {
      title: 'Personalized Learning Paths',
      description: 'Get customized suggestions based on your skill goals and learning history.',
      icon: '🎯',
    },
    {
      title: 'Session Scheduling',
      description: 'Easily plan 1-on-1 or group sessions and sync with your calendar.',
      icon: '📅',
    },
    {
      title: 'Progress Tracking',
      description: 'Track your learning milestones and performance over time.',
      icon: '📈',
    },
    {
      title: 'Community Forums',
      description: 'Discuss ideas, ask questions, and help others in open forums.',
      icon: '💬',
    },
    {
      title: 'Secure Authentication',
      description: 'Robust signup/login with session protection and encrypted passwords.',
      icon: '🔒',
    },
    {
      title: 'Expert Ratings & Reviews',
      description: 'Rate your mentors or learners after each session.',
      icon: '⭐',
    },
    {
      title: 'Notifications & Reminders',
      description: 'Get updates on new sessions, feedback, and platform activity.',
      icon: '🔔',
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>💡 Core Features</h1>
      <p className={styles.intro}>
        Explore the key features that make our skill-exchange platform effective, interactive, and empowering.
      </p>

      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.icon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
