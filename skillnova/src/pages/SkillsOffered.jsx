import React from 'react';
import styles from '../styles/SkillsOffered.module.css';
import { Link } from 'react-router-dom';
import {
  FaCode, FaChartBar, FaPaintBrush, FaBullhorn,
  FaGlobe, FaLanguage, FaDatabase, FaRobot,
  FaVideo, FaTools, FaMusic, FaRunning, FaCameraRetro,
  FaHandsHelping, FaHeartbeat
} from 'react-icons/fa';

const skills = [
  { name: 'Web Development', icon: <FaCode />, slug: 'web-development', description: 'HTML, CSS, JavaScript, React' },
  { name: 'Data Analysis', icon: <FaChartBar />, slug: 'data-analysis', description: 'Excel, Python, SQL, Power BI' },
  { name: 'Graphic Design', icon: <FaPaintBrush />, slug: 'graphic-design', description: 'Photoshop, Illustrator, Figma' },
  { name: 'Public Speaking', icon: <FaBullhorn />, slug: 'public-speaking', description: 'Confidence, Persuasion, Delivery' },
  { name: 'Digital Marketing', icon: <FaGlobe />, slug: 'digital-marketing', description: 'SEO, Social Media, Campaigns' },
  { name: 'Language Learning', icon: <FaLanguage />, slug: 'language-learning', description: 'English, Japanese, French' },
  { name: 'Database Design', icon: <FaDatabase />, slug: 'database-design', description: 'SQL, ERD, Normalization' },
  { name: 'AI & ML', icon: <FaRobot />, slug: 'ai-ml', description: 'Machine Learning, AI Concepts' },
  { name: 'Video Editing', icon: <FaVideo />, slug: 'video-editing', description: 'Premiere Pro, After Effects' },
  { name: 'Soft Skills', icon: <FaTools />, slug: 'soft-skills', description: 'Teamwork, Leadership, Time Management' },
  { name: 'Music', icon: <FaMusic />, slug: 'music', description: 'Singing, Instruments, Theory' },
  { name: 'Dance', icon: <FaRunning />, slug: 'dance', description: 'Classical, Western, Freestyle' },
  { name: 'Photography', icon: <FaCameraRetro />, slug: 'photography', description: 'DSLR, Composition, Editing' },
  { name: 'Volunteering', icon: <FaHandsHelping />, slug: 'volunteering', description: 'Community, Events, Social Work' },
  { name: 'Health & Wellness', icon: <FaHeartbeat />, slug: 'health-wellness', description: 'Yoga, Nutrition, Fitness' }
];

export default function SkillsOffered() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🛠️ Skills Offered</h1>
      <p className={styles.subtext}>Explore skills you can teach or learn from the community.</p>

      <div className={styles.grid}>
        {skills.map((skill, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{skill.icon}</div>
            <h3 className={styles.title}>{skill.name}</h3>
            <p className={styles.description}>{skill.description}</p>
            <Link to={`/skills/${skill.slug}`} className={styles.learnMore}>Learn More →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
