import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Feedback.module.css';
import bgImage from '../assets/feedback-bg.webp';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

export default function FeedbackPage() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  const [userEmail, setUserEmail] = useState('');
  const [mood, setMood] = useState('');
  const [rating, setRating] = useState(0);
  const [features, setFeatures] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);
    else alert(t('feedback.loginRequired'));
  }, [t]);

  const handleFeatureChange = (feature) => {
    setFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleSubmit = async () => {
    const missing = [];
    if (!mood) missing.push(t('feedback.mood'));
    if (!rating) missing.push(t('feedback.rating'));
    if (features.length === 0) missing.push(t('feedback.features'));
    if (!feedback.trim()) missing.push(t('feedback.suggestions'));
    if (!userEmail) {
      alert(t('feedback.loginRequired'));
      return;
    }
    if (missing.length > 0) {
      alert(`${t('feedback.fillFields')}: ${missing.join(', ')}`);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5137/api/feedback/submit', {
        userEmail,
        mood,
        rating,
        features,
        suggestions: feedback.trim(),
      });

      if (response.status === 201) {
        alert(t('feedback.thankYou'));
        setMood(''); setRating(0); setFeatures([]); setFeedback('');
      } else {
        alert(t('feedback.submitError'));
      }
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      alert(t('feedback.submitError'));
    }
  };

  const featureOptions = [
    { id: 'matching', label: t('feedback.feature.matching') },
    { id: 'filters', label: t('feedback.feature.filters') },
    { id: 'scheduling', label: t('feedback.feature.scheduling') },
    { id: 'progress', label: t('feedback.feature.progress') },
  ];

  const moods = [
    { id: 'happy', emoji: '😊', label: t('feedback.mood') + ': Happy' },
    { id: 'neutral', emoji: '😐', label: t('feedback.mood') + ': Neutral' },
    { id: 'sad', emoji: '🙁', label: t('feedback.mood') + ': Sad' },
  ];

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      <div
        className={`${styles.feedbackCard} ${theme === 'dark' ? styles.dark : ''}`}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h1>{t('feedback.title')}</h1>

          <div className={styles.section}>
            <p>{t('feedback.moodQuestion')}</p>
            <div className={styles.moodOptions}>
              {moods.map(({ id, emoji }) => (
                <button
                  key={id}
                  className={`${styles.moodBtn} ${mood === id ? styles.selected : ''}`}
                  onClick={() => setMood(id)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p>{t('feedback.ratingQuestion')}</p>
            <div className={styles.rating}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  className={`${styles.ratingBtn} ${rating === num ? styles.selected : ''}`}
                  onClick={() => setRating(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p>{t('feedback.featureQuestion')}</p>
            <div className={styles.featureList}>
              {featureOptions.map(({ id, label }) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    checked={features.includes(id)}
                    onChange={() => handleFeatureChange(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p>{t('feedback.suggestions')}</p>
            <textarea
              className={styles.textarea}
              placeholder={t('feedback.placeholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit}>
            {t('feedback.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
