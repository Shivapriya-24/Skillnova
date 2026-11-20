import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styles from '../styles/SkillsPage.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useLocation } from 'react-router-dom';

export default function RecommendationsPage() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [proofToggles, setProofToggles] = useState({});
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('role')?.toLowerCase() || 'learner&teacher';
  const location = useLocation();
  const selectedSkillSlug = location.state?.skill || null;

  useEffect(() => {
    const loadData = async () => {
      if (!userEmail) {
        alert(t('feedback.loginRequired'));
        setLoading(false);
        return;
      }

      let currentUser = {};
      try {
        const userRes = await axios.get('http://localhost:5137/api/skills/get', { params: { email: userEmail } });
        currentUser = userRes.data || {};
      } catch (err) {
        if (err.response?.status !== 404) console.error('Current user fetch error:', err);
      }

      try {
        const [allRes, reqRes] = await Promise.all([
          axios.get('http://localhost:5137/api/skills/all'),
          axios.get('http://localhost:5137/api/sessions/requests', { params: { email: userEmail } }),
        ]);

        const allProfiles = allRes.data || [];
        const sent = (reqRes.data?.sent || []).map(r => r.teacherEmail);
        setSentRequests(sent);

        let filtered = allProfiles.filter(p => p.email !== userEmail);

        if (selectedSkillSlug) {
          const search = selectedSkillSlug.toLowerCase().replace(/-/g, ' ');
          filtered = filtered
            .map(p => ({
              ...p,
              matchedSkills: (p.knownSkills || []).filter(ks => {
                const skillName = (ks.skill || '').toLowerCase();
                const skillSlug = (ks.slug || '').toLowerCase();
                const skillDesc = (ks.description || '').toLowerCase();
                return (
                  skillName.includes(search) ||
                  skillSlug.includes(search) ||
                  skillDesc.includes(search)
                );
              }),
            }))
            .filter(p => p.matchedSkills.length > 0);
        } else {
          if (userRole === 'learner') {
            filtered = filtered
              .map(p => ({
                ...p,
                matchedSkills: (p.knownSkills || []).filter(ks =>
                  (currentUser.wantedSkills || []).some(
                    ws => ws.toLowerCase() === ks.skill.toLowerCase()
                  )
                ),
              }))
              .filter(p => p.matchedSkills.length > 0);
          } else if (userRole === 'teacher') {
            filtered = filtered
              .map(p => ({
                ...p,
                matchedSkills: (p.wantedSkills || []).filter(ws =>
                  (currentUser.knownSkills || []).some(
                    ks => ks.skill.toLowerCase() === ws.toLowerCase()
                  )
                ).map(skill => ({ skill })), 
              }))
              .filter(p => p.matchedSkills.length > 0);
          } else {
            const teachMatches = filtered
              .map(p => ({
                ...p,
                matchedSkills: (p.wantedSkills || []).filter(ws =>
                  (currentUser.knownSkills || []).some(
                    ks => ks.skill.toLowerCase() === ws.toLowerCase()
                  )
                ).map(skill => ({ skill })),
              }))
              .filter(p => p.matchedSkills.length > 0);

            const learnMatches = filtered
              .map(p => ({
                ...p,
                matchedSkills: (p.knownSkills || []).filter(ks =>
                  (currentUser.wantedSkills || []).some(
                    ws => ws.toLowerCase() === ks.skill.toLowerCase()
                  )
                ),
              }))
              .filter(p => p.matchedSkills.length > 0);
            const allCombined = [...teachMatches, ...learnMatches];
            const uniqueByEmail = Object.values(
              allCombined.reduce((acc, p) => {
                if (!acc[p.email]) acc[p.email] = p;
                return acc;
              }, {})
            );
            filtered = uniqueByEmail;
          }
        }

        setMatches(filtered);
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userEmail, userRole, t, selectedSkillSlug]);

  const sendRequest = async (receiverEmail, skill) => {
    try {
      await axios.post('http://localhost:5137/api/sessions/request', {
        requesterEmail: userEmail,
        receiverEmail,
        skill,
        note: '',
      });
      setSentRequests(prev => [...prev, receiverEmail]);
    } catch (err) {
      console.error(err);
      alert('Error sending request');
    }
  };

  const cleanProofPath = proofPath =>
    proofPath.replace(/\\/g, '/').replace(/^public\/uploads\//, '');

  const getFileExtension = filename => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const fileTypeIcons = {
    pdf: '📄',
    docx: '📄',
    doc: '📄',
    txt: '📝',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    webp: '🖼️',
    gif: '🖼️',
    default: '📁',
  };

  const toggleProofView = (profileIdx, skillIdx) => {
    const key = `${profileIdx}-${skillIdx}`;
    setProofToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const wrapperClass = `${styles.pageWrapper} ${
    theme === 'dark' ? styles.dark : ''
  }`.trim();

  return (
    <div className={wrapperClass}>
      <div className={styles.card}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h1 className={styles.heading}>
            {userRole === 'teacher'
              ? '👩‍🏫 Learners Who Want Your Skills'
              : userRole === 'learner'
              ? '🧑‍🏫 People Who Can Help You Learn'
              : '🌐 Recommended Matches'}
          </h1>

          {loading ? (
            <p>{t('skills.loading')}</p>
          ) : !matches.length ? (
            <p>{t('skills.noMatches')}</p>
          ) : (
            <ul className={styles.recommendList}>
              {matches.map((profile, pIdx) => (
                <li key={pIdx} className={styles.recommendCard}>
                  <h3>{profile.displayName || profile.email}</h3>
                  <p><strong>📍 Location:</strong> {profile.location}</p>
                  <p><strong>🌐 Language:</strong> {profile.languagePref}</p>

                  <p><strong>✅ Matched Skills:</strong></p>
                  <ul>
                    {profile.matchedSkills.map((ks, sIdx) => {
                      const proofVisible = proofToggles[`${pIdx}-${sIdx}`] || false;
                      return (
                        <li key={sIdx}>
                          🔹 <strong>{ks.skill}</strong>
                          {ks.proofPaths?.length > 0 && (
                            <div className={styles.proofSection}>
                              <button
                                type="button"
                                className={styles.viewProofButton}
                                onClick={() => toggleProofView(pIdx, sIdx)}
                                style={{ backgroundColor: '#ed8936', color: 'white' }}
                              >
                                {proofVisible ? 'Hide Proof' : 'View Proof'}
                              </button>
                              {proofVisible && (
                                <ul className={styles.proofList}>
                                  {ks.proofPaths.map((proofPath, proofIdx) => {
                                    const cleanPath = cleanProofPath(proofPath);
                                    const fileUrl = `http://localhost:5137/uploads/${cleanPath}`;
                                    const ext = getFileExtension(cleanPath);
                                    const icon = fileTypeIcons[ext] || fileTypeIcons.default;
                                    return (
                                      <li key={proofIdx} className={styles.proofItem}>
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={styles.proofLink}
                                        >
                                          {icon} Proof {proofIdx + 1}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {sentRequests.includes(profile.email) ? (
                    <button className={styles.greenButton} disabled>
                      Request Sent
                    </button>
                  ) : (
                    <button
                      className={styles.greenButton}
                      onClick={() =>
                        sendRequest(profile.email, profile.matchedSkills[0].skill)
                      }
                    >
                      Request Session
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
