import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaGithub, FaLinkedin, FaInstagram, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.socials}>
            {/* Replace with your real URLs */}
            <a href="https://github.com/YourOrg" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://www.linkedin.com/company/your-company" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://www.instagram.com/yourprofile" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer"><FaDiscord /></a>
          </div>
          <div className={styles.cta}>
            <h2>Ready to start trading skills?</h2>
            <Link to="/signup" className={styles.signupBtn}>Sign Up Free →</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <ul className={styles.links}>
            {/* Internal routes or external pages as needed */}
            <li><Link to="/about">About</Link></li>
            <li><Link to="/terms">Terms</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <p className={styles.brand}>SkillNova</p>
          <p className={styles.credit}>
            © {new Date().getFullYear()} SkillNova. Built with ❤️ by skill swappers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
