import React from 'react';
import styles from '../styles/Topbar.module.css';

export default function Topbar({ username }) {
  return (
    <div className={styles.topbar}>
      <h1 className={styles.greeting}>Welcome back, {username} 👋</h1>
    </div>
  );
}
