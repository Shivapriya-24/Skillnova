import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SkillsPage.module.css';
import bgImage from '../assets/skillpage-bg.webp';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;

export default function SkillsPage() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('learner&teacher');
  const [knownSkills, setKnownSkills] = useState([{ skill: '', proof: [], existingProofPaths: [] }]);
  const [wantedSkills, setWantedSkills] = useState(['']);
  const [languagePref, setLanguagePref] = useState('en');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('role');

    if (!email) {
      alert(t('feedback.loginRequired'));
      return;
    }

    setUserEmail(email);

    if (storedRole && ['learner', 'teacher', 'both', 'learner&teacher'].includes(storedRole.toLowerCase())) {
      setRole(storedRole.toLowerCase());
    } else {
      setRole('learner&teacher');
      localStorage.setItem('role', 'learner&teacher');
    }

    axios.get('http://localhost:5137/api/skills/get', { params: { email } })
      .then((res) => {
        const profile = res.data;
        setLanguagePref(profile.languagePref || 'en');
        setLocation(profile.location || '');
        setWantedSkills(profile.wantedSkills?.length ? profile.wantedSkills : ['']);
        setKnownSkills(profile.knownSkills?.length ? profile.knownSkills.map(ks => ({
          skill: ks.skill,
          proof: [],
          existingProofPaths: ks.proofPaths || [],
        })) : [{ skill: '', proof: [], existingProofPaths: [] }]);
      })
      .catch((err) => {
        if (err.response?.status !== 404) console.error(err);
      });
  }, [t]);

  const addKnownSkill = () => setKnownSkills(prev => [...prev, { skill: '', proof: [], existingProofPaths: [] }]);
  const removeLastKnownSkill = () => setKnownSkills(prev => prev.slice(0, -1));
  const handleKnownChange = (idx, field, val) => {
    const updated = [...knownSkills];
    updated[idx][field] = val;
    setKnownSkills(updated);
  };
  const handleProofChange = (idx, files) => {
    const updated = [...knownSkills];
    updated[idx].proof = [...updated[idx].proof, ...Array.from(files)];
    setKnownSkills(updated);
  };
  const removeProofFile = (idx, fidx) => {
    const updated = [...knownSkills];
    updated[idx].proof.splice(fidx, 1);
    setKnownSkills(updated);
  };
  const removeExistingProof = (idx, fidx) => {
    const updated = [...knownSkills];
    updated[idx].existingProofPaths.splice(fidx, 1);
    setKnownSkills(updated);
  };
  const handleWantedChange = (idx, val) => {
    const updated = [...wantedSkills];
    updated[idx] = val;
    setWantedSkills(updated);
  };
  const addWantedSkill = () => setWantedSkills(prev => [...prev, '']);
  const removeWantedSkill = (idx) => {
    if (wantedSkills.length > 1) setWantedSkills(prev => prev.filter((_, i) => i !== idx));
  };
  const validateProofByContent = async (skillName, files) => {
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      try {
        if (ext === 'pdf') {
          const buffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it) => it.str).join(' ');
          }
          if (text.toLowerCase().includes(skillName.toLowerCase())) return true;
        } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
          const dataURL = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(file);
          });
          const result = await Tesseract.recognize(dataURL, 'eng');
          if (result.data.text.toLowerCase().includes(skillName.toLowerCase())) return true;
        } else if (['txt', 'html'].includes(ext)) {
          const content = await file.text();
          if (content.toLowerCase().includes(skillName.toLowerCase())) return true;
        }
      } catch (err) {
        console.error('Proof validation error:', err);
      }
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!userEmail) return alert(t('feedback.loginRequired'));
    setLoading(true);
    try {
      if (role !== 'learner') {
        for (const ks of knownSkills) {
          if (!ks.skill.trim()) {
            alert('Please fill all known skill fields.');
            setLoading(false);
            return;
          }
          if (!ks.proof.length && !ks.existingProofPaths.length) {
            alert(`Proof required for "${ks.skill}"`);
            setLoading(false);
            return;
          }
          if (ks.proof.length) {
            const isValid = await validateProofByContent(ks.skill, ks.proof);
            if (!isValid) {
              alert(`Uploaded file does not mention "${ks.skill}"`);
              setLoading(false);
              return;
            }
          }
        }
      }
      if (role !== 'teacher' && wantedSkills.some(s => !s.trim())) {
        alert('Please complete all wanted skills.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('languagePref', languagePref);
      formData.append('location', location);
      if (role !== 'teacher') formData.append('wantedSkills', JSON.stringify(wantedSkills));
      if (role !== 'learner') formData.append('knownSkills', JSON.stringify(knownSkills.map(ks => ({ skill: ks.skill }))));
      knownSkills.forEach(ks => ks.proof.forEach(file => formData.append('proofs', file)));

      await axios.post('http://localhost:5137/api/skills/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/recommendations');
    } catch (err) {
      console.error(err);
      alert('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.card} style={{ backgroundImage: `url(${bgImage})` }}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h1 className={styles.heading}>{t('skills.title')}</h1>

          {/* Teacher / Both: Known Skills */}
          {(role === 'teacher' || role === 'both' || role === 'learner&teacher') && (
            <section className={styles.section}>
              <h2 className={styles.subheading}>{t('skills.canTeach')}</h2>
              {knownSkills.map((item, idx) => (
                <div key={idx} className={styles.skillRow}>
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={item.skill}
                    onChange={(e) => handleKnownChange(idx, 'skill', e.target.value)}
                    className={styles.input}
                  />
                  <label className={styles.customFileLabel}>
                    📁 Upload Proof
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.txt,.html"
                      onChange={(e) => handleProofChange(idx, e.target.files)}
                      className={styles.fileInput}
                    />
                  </label>
                  {item.existingProofPaths?.map((p, i) => (
                    <div key={i} className={styles.fileItem}>
                      <a href={`http://localhost:5137/${p}`} target="_blank" rel="noopener noreferrer">
                        Proof {i + 1}
                      </a>
                      <button onClick={() => removeExistingProof(idx, i)} className={styles.removeBtn}>✖</button>
                    </div>
                  ))}
                  {item.proof?.map((file, i) => (
                    <div key={i} className={styles.fileItem}>
                      {file.name}
                      <button onClick={() => removeProofFile(idx, i)} className={styles.removeBtn}>✖</button>
                    </div>
                  ))}
                  {idx === knownSkills.length - 1 && knownSkills.length > 1 && (
                    <button onClick={removeLastKnownSkill} className={styles.removeSkillBtn}>Remove Skill</button>
                  )}
                </div>
              ))}
              <button onClick={addKnownSkill} className={styles.addBtn}>+ Add Skill</button>
            </section>
          )}

          {/* Learner / Both: Wanted Skills */}
          {(role === 'learner' || role === 'both' || role === 'learner&teacher') && (
            <section className={styles.section}>
              <h2 className={styles.subheading}>{t('skills.wantToLearn')}</h2>
              {wantedSkills.map((skill, idx) => (
                <div key={idx} className={styles.skillRow}>
                  <input
                    type="text"
                    placeholder="Skill to learn"
                    value={skill}
                    onChange={(e) => handleWantedChange(idx, e.target.value)}
                    className={styles.input}
                  />
                  {wantedSkills.length > 1 && (
                    <button onClick={() => removeWantedSkill(idx)} className={styles.removeSkillBtn}>✖</button>
                  )}
                </div>
              ))}
              <button onClick={addWantedSkill} className={styles.addBtn}>+ Add Wanted Skill</button>
            </section>
          )}

          {/* Language Preference */}
          <section className={styles.section}>
            <h2 className={styles.subheading}>{t('skills.preferences')}</h2>
            <select
              value={languagePref}
              onChange={(e) => setLanguagePref(e.target.value)}
              className={styles.input}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="fr">Français</option>
            </select>
          </section>

          {/* Location */}
          <section className={styles.section}>
            <h2 className={styles.subheading}>📍 {t('skills.location')}</h2>
            <input
              type="text"
              placeholder="Your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
            />
          </section>

          <button
            onClick={handleSubmit}
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Save & Get Recommendations'}
          </button>
        </div>
      </div>
    </div>
  );
}
