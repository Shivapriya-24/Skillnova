import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styles from '../styles/Achievements.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import AchievementBadge from '../components/AchievementBadge'; 
 
const API = 'http://localhost:5137';
 
export default function Achievements() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const userEmail = localStorage.getItem('userEmail') || null;
 
  const [achievements, setAchievements] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); 
 
  useEffect(() => {
    if (!userEmail) {
      setError(t('achievements.noUser') || 'No logged-in user.');
      return;
    }
    fetchAchievements();
  }, [userEmail]);
 
  async function fetchAchievements() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/achievements/${encodeURIComponent(userEmail)}`);
      const list = Array.isArray(res.data?.achievements) ? res.data.achievements : [];
      setAchievements(list);
    } catch (e) {
      console.error('Failed to fetch achievements', e);
      setError(t('achievements.fetchError') || 'Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  }
 
  async function recalcAchievements() {
    if (!userEmail) {
      setError(t('achievements.noUser') || 'No logged-in user.');
      return;
    }
    setRecalcLoading(true);
    try {
      await axios.post(`${API}/api/achievements/calculate/${encodeURIComponent(userEmail)}`);
      await fetchAchievements();
    } catch (e) {
      console.error('Recalc failed', e);
      setError(t('achievements.recalcError') || 'Failed to recalculate achievements.');
    } finally {
      setRecalcLoading(false);
    }
  }
 
  function filteredList() {
    if (filter === 'all') return achievements;
    if (filter === 'earned') return achievements.filter((a) => a.earned);
    if (filter === 'inprogress') return achievements.filter((a) => !a.earned && a.progress > 0);
    return achievements;
  }
 
  async function handleShare(achievements) {
    const text = `${achievements.title} — ${achievements.description || ''}`;
    const shareData = {
      title: achievements.title,
      text,
      url: `${window.location.origin}/achievements/public/${encodeURIComponent(email)}/${badgeKey}`, 
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert(t('achievements.shareCopied') || 'Share link copied to clipboard.');
      }
    } catch (e) {
      console.error('Share failed', e);
      alert(t('achievements.shareError') || 'Could not share badge.');
    }
  }
 
  function handleDownload(ach) {
    const data = {
      id: ach.id,
      key:ach.key,
      title: ach.title,
      description: ach.description,
      earned: ach.earned,
      progress: ach.progress,
      earnedAt: ach.earnedAt || null,
      icon:ach.icon || null,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillnova_badge_${ach.key || ach.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
 
  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>{t('achievements.title') || 'Achievements'}</h1>
            <p className={styles.subtitle}>{t('achievements.subtitle') || 'Your earned badges, progress & milestones'}</p>
          </div>
 
          <div className={styles.controls}>
            <div className={styles.filterRow}>
              <label htmlFor="filter">{t('achievements.filter') || 'Filter:'}</label>
              <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">{t('achievements.filterAll') || 'All'}</option>
                <option value="earned">{t('achievements.filterEarned') || 'Earned'}</option>
                <option value="inprogress">{t('achievements.filterInProgress') || 'In progress'}</option>
              </select>
            </div>
            <div className={styles.actionButtons}>
              <button onClick={fetchAchievements} disabled={loading}>
                {loading ? (t('achievements.refreshing') || 'Refreshing...') : (t('achievements.refresh') || 'Refresh')}
              </button>
              <button onClick={recalcAchievements} disabled={recalcLoading}>
                {recalcLoading ? (t('achievements.recalculating') || 'Recalculating...') : (t('achievements.recalculate') || 'Recalculate')}
              </button>
            </div>
          </div>
        </header>
 
        {error && <div className={styles.error}>{error}</div>}
 
        {loading ? (
          <div className={styles.loading}>{t('achievements.loading') || 'Loading...'}</div>
        ) : (
          <main>
            {filteredList().length === 0 ? (
              <div className={styles.empty}>
                <p>{t('achievements.noBadges') || "You haven't earned any badges yet."}</p>
                <small>{t('achievements.hint') || 'Complete sessions, give feedback and share knowledge to earn badges.'}</small>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredList().map((achievements) => (
                  <div key={achievements.id || achievements.key} className={styles.gridItem}>
                    {/* If you created a separate AchievementBadge component, it'll render it.
                        Otherwise fallback to a simple inlined card UI. */}
                    {AchievementBadge ? (
                      <AchievementBadge
                        achievement={achievements}
                        theme={theme}
                        onShare={() => handleShare(achievements)}
                        onDownload={() => handleDownload(achievements)}
                        t={t}
                      />
                    ) : (
                      <div className={styles.badgeCard}>
                        <div className={styles.badgeTop}>
                          <img
                            src={achievements.iconUrl || '/images/default-badge.svg'}
                            alt={achievement.title}
                            className={styles.badgeIcon}
                          />
                          <div className={styles.badgeMeta}>
                            <h3>{achievements.title}</h3>
                            <div className={styles.badgeStatus}>
                              {achievements.earned ? <span className={styles.earned}>{t('achievements.earned') || 'Earned'}</span> : <span className={styles.inProgress}>{Math.round(achievements.progress || 0)}%</span>}
                            </div>
                          </div>
                        </div>
                        <p className={styles.badgeDesc}>{achievements.description}</p>
                        <div className={styles.progressRow}>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${Math.min(100, achievements.progress || 0)}%` }} />
                          </div>
                          {achievements.earnedAt && <small className={styles.earnedAt}>{new Date(achievements.earnedAt).toLocaleDateString()}</small>}
                        </div>
                        <div className={styles.badgeActions}>
                          <button onClick={() => handleShare(achievements)}>{t('achievements.share') || 'Share'}</button>
                          <button onClick={() => handleDownload(achievements)}>{t('achievements.download') || 'Download'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
