import React from 'react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'Laila, 35 - Mexico',
    text: '"It’s such a cool feature — I learnt conversational French with one to one exchange."',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Ayo, 24 - Botswana',
    text: '"Creative, fun and productive skill swap sessions with others around the world."',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Sara, 28 - Canada',
    text: '"Great platform, really helped me pick up new skills fast and with great people."',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    name: 'James, 39 - UK',
    text: '"I enjoy learning skills at my own pace and sharing what I know with others."',
    avatar: 'https://randomuser.me/api/portraits/men/70.jpg'
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials}>
      <h2>Real Stories from the SkillNova Community</h2>
      <div className={styles.cards}>
        {testimonials.map(({ name, text, avatar }) => (
          <article key={name} className={styles.card}>
            <img src={avatar} alt={name} className={styles.avatar} />
            <p className={styles.text}>{text}</p>
            <p className={styles.name}>{name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
