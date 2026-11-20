import React from 'react';
import { Link } from 'react-router-dom'; 
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <a href="#" className={styles.logo}>SkillNova</a>
        <ul className={styles.navLinks}>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#browse-skills">Browse Skills</a></li>
          <li><a href="#become-a-member">Become a Member</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <Link to="/signup" className={styles.btnPrimary}>Get Started Free</Link> 
      </nav>
    </header>
  );
}
