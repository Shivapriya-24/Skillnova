import React, { useContext } from 'react';
import styles from '../styles/SkillsPage.module.css';
import bgImage from '../assets/feedback-bg.webp';
import { ThemeContext } from '../context/ThemeContext';

export default function Layout({ children }) {
  const { theme } = useContext(ThemeContext);
  const wrapperClass = `${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`.trim();

  return (
    <div className={wrapperClass}>
      <div className={styles.card} style={{ backgroundImage: `url(${bgImage})` }}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
