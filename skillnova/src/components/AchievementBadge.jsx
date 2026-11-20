import React from 'react';
import styles from '../styles/Achievements.module.css';

export default function AchievementBadge({ achievement, theme, t }) {
  const {
    id,
    key: badgeKey,
    title,
    description,
    earned = false,
    progress = 0,
    earnedAt = null,
    icon,
  } = achievement || {};

  const iconSrc= achievement.icon || '/images/default-badge.svg';
  const pct = Math.min(100, Math.max(0, Math.round(progress || 0)));
  const handleShare = async () => {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    alert('No user email found');
    return;
  }
  const shareData = {
    title,
    text: `${title} — ${description}`,
    url: `${window.location.origin}/achievements/public/${encodeURIComponent(email)}/${badgeKey}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error('Share failed', err);
    }
  } else {
    await navigator.clipboard.writeText(shareData.url);
    alert('Link copied to clipboard. Paste it anywhere to share.');
  }
};
  
     const handleDownload = () => {
    const data = {
      id,
      key: badgeKey,
      title,
      description,
      earned,
      progress,
      earnedAt,
      icon : iconSrc, 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${badgeKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <article
      className={`${styles.badgeCard} ${earned ? styles.badgeEarned : ''} ${theme === 'dark' ? styles.dark : ''}`}
      aria-labelledby={`badge-title-${id || badgeKey}`}
      role="group"
    >
      <div className={styles.badgeTop}>
        <img src={iconSrc}
          alt={title} 
          className={styles.badgeIcon} />
        <div className={styles.badgeMeta}>
          <h3 id={`badge-title-${id || badgeKey}`} className={styles.badgeTitle}>
            {title}
          </h3>
          <div className={styles.badgeStatus}>
            {earned ? (
              <span className={styles.earned}>{t?.('achievements.earned') || 'Earned'}</span>
            ) : (
              <span className={styles.inProgress}>{pct}%</span>
            )}
          </div>
        </div>
      </div>

      {description && <p className={styles.badgeDesc}>{description}</p>}

      <div className={styles.progressRow}>
        <div className={styles.progressBar} aria-hidden>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        {earnedAt && <small className={styles.earnedAt}>{new Date(earnedAt).toLocaleDateString()}</small>}
      </div>

      <div className={styles.badgeActions}>
        <button className={styles.primaryBtn} onClick = {handleShare}>
          {t?.('achievements.share') || 'Share'}
        </button>
        <button className={styles.ghostBtn} onClick= {handleDownload}>
          {t?.('achievements.download') || 'Download'}
        </button>
      </div>
    </article>
  );
}
