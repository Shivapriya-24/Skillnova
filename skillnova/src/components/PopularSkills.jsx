import React from 'react';
import styles from './PopularSkills.module.css';
import art from '../assets/art.jpg';
import language from '../assets/language.jpg';
import code from '../assets/code.jpg';
import music from '../assets/music.jpg';
import career from '../assets/resume.jpg';
import photo from '../assets/photo.jpg';

const skills = [
  { title: 'Digital Art', description: 'Learn or teach illustration, painting, and design.', image: art },
  { title: 'Language Exchange', description: 'Practice languages through conversation.', image: language },
  { title: 'Web Development', description: 'Learn HTML, CSS, JavaScript & React.', image: code },
  { title: 'Musical Lessons', description: 'Learn instruments, vocals or theory.', image: music },
  { title: 'Career Help', description: 'Resume reviews, interview prep, mentoring.', image: career },
  { title: 'Photography Basics', description: 'Master composition and editing.', image: photo },
];

export default function PopularSkills() {
  return (
    <section className={styles.popularSkills} id="browse-skills">
      <h2>Popular Skills to Trade</h2>
      <div className={styles.grid}>
        {skills.map(({ title, description, image }) => (
          <div key={title} className={styles.card}>
            <img src={image} alt={title} className={styles.image} />
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
