import React, { useContext, useState, useEffect } from 'react';
import styles from '../styles/SettingsPage.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext, languages } from '../context/LanguageContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/settings-bg.avif';

export default function SettingsPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserInfo() {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No user email found in localStorage.');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5137/api/userinfo', {
          params: { email },
        });
        setUserInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError(t('settings.loadError') || 'Failed to load user info.');
        setUserInfo({ username: 'Unknown', email: '' });
      }
    }

    fetchUserInfo();
  }, [t]);

  const handleDeleteAccount = async () => {
    if (!userInfo?.email) {
      alert(t('settings.missingEmail') || 'User email missing.');
      return;
    }

    const confirmDelete = window.confirm(
      `${t('settings.deleteAccountConfirm')}\n\n${t('settings.username')}: ${userInfo.username}`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setError(null);

      await axios.delete('http://localhost:5137/api/delete-account', {
        data: { email: userInfo.email },
      });

      localStorage.clear();
      alert(t('settings.accountDeleted'));
      navigate('/signup');
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(t('settings.deleteAccountError'));
      setDeleting(false);
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      <div
        className={`${styles.settingsPage} ${theme === 'dark' ? styles.dark : styles.light}`}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1>{t('settings.title')}</h1>

        {/* Theme Section */}
        <section className={styles.settingSection}>
          <h2>{t('settings.theme')}</h2>
          <label className={styles.switch}>
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className={styles.slider}></span>
          </label>
          <span>
            {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
          </span>
        </section>

        {/* Language Section */}
        <section className={styles.settingSection}>
          <h2>{t('settings.language')}</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={styles.select}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </section>

        {/* Account Section */}
        <section className={styles.settingSection}>
          <h2>{t('settings.account')}</h2>
          <p><strong>{t('username')}:</strong> {userInfo ? userInfo.username : t('settings.loading')}</p>
          <p className={styles.warning}>
            ⚠️ {t('settings.accountWarning')}
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.deleteButton}
            onClick={handleDeleteAccount}
            disabled={deleting || !userInfo}
          >
            {deleting ? t('settings.deleting') : t('settings.deleteAccount')}
          </button>
        </section>
      </div>
    </div>
  );
}
