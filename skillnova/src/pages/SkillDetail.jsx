import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/SkillDetails.module.css';

export default function SkillDetails() {
  const { skillName } = useParams();
  const skillSlug = skillName; 
  const formattedSkill = skillName.replace(/-/g, ' ');
  const navigate = useNavigate();

  const handleStartLearning = (slug) => {
    navigate('/recommendations', { state: { skill: slug } });
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Skill: {formattedSkill}</h1>
        <p className={styles.description}>
          This is the detail page for <strong>{formattedSkill}</strong>. You can add videos, guides, and resources here.
        </p>
        <div className={styles.buttons}>
          <button
            className={styles.skipBtn}
            onClick={() => window.history.back()}
          >
            ⬅ Back
          </button>
          {/* ✅ use skillSlug, not skill.slug */}
          <button
            onClick={() => handleStartLearning(skillSlug)}
            className={styles.nextBtn}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
