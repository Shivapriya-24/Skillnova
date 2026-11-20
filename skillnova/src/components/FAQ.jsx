import React, { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
  { question: "What is skill bartering/platform?", answer: "It is a service that connects users for exchanging skills without money." },
  { question: "What is a skill bartering platform?", answer: "A platform where users trade skills and knowledge directly with each other." },
  { question: "Is the platform completely free to use?", answer: "Yes, there are no fees or charges for using SkillNova." },
  { question: "How do I start bartering my skills?", answer: "Sign up, create your profile, and browse available skills to trade." },
  { question: "What kind of skills can I trade?", answer: "Anything from digital art, languages, music lessons, web development, and more." },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (i) => {
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <section className={styles.faq} id="faq">
      <h2>Frequently Asked Questions</h2>
      <div className={styles.container}>
        {faqs.map(({ question, answer }, i) => (
          <div key={i} className={styles.item}>
            <button className={styles.question} onClick={() => toggle(i)}>
              {question}
              <span className={styles.toggle}>{activeIndex === i ? '−' : '+'}</span>
            </button>
            {activeIndex === i && <p className={styles.answer}>{answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
