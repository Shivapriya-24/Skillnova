import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { skills } from '../data/skills';

export default function DashboardLayout({ children }) {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    const results = skills.filter(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSkills(results);
    setShowDropdown(searchQuery.trim() !== '' && results.length > 0);
    setHighlightedIndex(-1); 
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (skill) => {
    setSearchQuery('');
    setShowDropdown(false);
    navigate(`/skills/${skill.slug}`);
  };
  

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredSkills.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSkills.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSkills.length) % filteredSkills.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (highlightedIndex >= 0 && highlightedIndex < filteredSkills.length) {
        handleSearchSelect(filteredSkills[highlightedIndex]);
      } 
  
      else {
        const exactMatch = filteredSkills.find(skill =>
          skill.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSearchSelect(exactMatch);
        }
      }
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.header}>
        <div className={styles.logo}>SkillNova</div>

        <div className={styles.searchBar} ref={searchRef}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            {(showDropdown || (searchQuery.trim() !== '' && filteredSkills.length === 0)) && (
              <ul className={styles.searchResults}>
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill, index) => (
                    <li
                      key={index}
                      className={`${styles.searchResultItem} ${index === highlightedIndex ? styles.highlighted : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleSearchSelect(skill)}
                    >
                      <strong>{skill.name}</strong> – <span style={{ color: '#666' }}>{skill.description}</span>
                    </li>
                  ))
                ) : (
                  <li className={styles.searchResultItem} style={{ color: '#999', cursor: 'default' }}>
                    No matching skills
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div
          className={styles.profile}
          onClick={() => navigate('/dashboard/profile')}
        >
          <span className={styles.profileText}>👤 Profile</span>
        </div>
      </header>

      <main className={styles.mainContent}>{children}</main>

      <footer className={styles.footer}>
        <a href="/contact-us">Contact Us</a> | <a href="/faq">FAQ</a>
      </footer>
    </div>
  );
}
