import React from 'react';
import styles from '../styles/TrendingSkills.module.css';
import { FaCode, FaRobot, FaPaintBrush } from 'react-icons/fa';

const trendingSkills = [
  { name: 'Web Development', icon: <FaCode />, description: 'HTML, CSS, JS, React' },
  { name: 'AI & ML', icon: <FaRobot />, description: 'AI concepts, ML, Python' },
  { name: 'Graphic Design', icon: <FaPaintBrush />, description: 'Photoshop, Illustrator, Figma' },
];

export default function TrendingSkills() {
  return (
    <div className={styles.trendingContainer}>
      <h2 className={styles.heading}>🔥 Trending Skills This Month</h2>
      <div className={styles.cardContainer}>
        {trendingSkills.map((skill, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{skill.icon}</div>
            <div>
              <h3 className={styles.skillName}>{skill.name}</h3>
              <p className={styles.description}>{skill.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
