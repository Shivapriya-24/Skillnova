import React, { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    dob: '',
    email: '',
    skillsKnown: '',
    bio: '',
    photo: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  const generateNameFromEmail = (email) => {
    if (!email) return '';
    return email
      .split('@')[0] 
      .replace(/[0-9]/g, '') 
      .replace(/[^a-zA-Z]/g, '') 
      .replace(/^\w/, (c) => c.toUpperCase()); 
  };

  const skillsToInterests = (skillsStr) =>
    skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const interestsToSkills = (interestsArr) => interestsArr.join(', ');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setMessage('No user email found. Please log in.');
      return;
    }

    async function fetchUserInfo() {
      try {
        const res = await fetch(
          `http://localhost:5137/api/userinfo?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error('Failed to load user info');
        const data = await res.json();

        setProfile((prev) => ({
          ...prev,
          email: data.email || email,
          name: data.username || generateNameFromEmail(email),
        }));
      } catch (err) {
        console.error(err);
        setProfile((prev) => ({
          ...prev,
          email,
          name: generateNameFromEmail(email),
        }));
      }
    }

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!profile.email) return;

    fetch(`http://localhost:5137/api/profile?email=${encodeURIComponent(profile.email)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({
            ...prev,
            name: data.name || prev.name, 
            dob: data.dob ? data.dob.slice(0, 10) : '',
            skillsKnown: interestsToSkills(data.interests || []),
            bio: data.bio || '',
          }));
          setIsEditing(false);
          setMessage('');
        } else if (res.status === 404) {
          setMessage('No profile found, please create one.');
          setIsEditing(true);
        } else {
          setMessage('Failed to fetch profile.');
        }
      })
      .catch(() => setMessage('Failed to fetch profile.'));
  }, [profile.email]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile((prev) => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
      if (name === 'email') setMessage('');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Invalid email';
    if (!profile.skillsKnown.trim()) newErrors.skillsKnown = 'Skills are required';
    if (!profile.bio.trim()) newErrors.bio = 'Bio is required';
    if (profile.dob) {
      const dobDate = new Date(profile.dob);
      const today = new Date();
      if (dobDate > today) newErrors.dob = 'Date of birth cannot be in the future';
    } else newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      alert('Please fix the errors before saving.');
      return;
    }

    const interests = skillsToInterests(profile.skillsKnown);

    try {
      let res = await fetch('http://localhost:5137/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          dob: profile.dob,
          bio: profile.bio,
          interests,
        }),
      });

      if (res.status === 404) {
        res = await fetch('http://localhost:5137/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
            dob: profile.dob,
            bio: profile.bio,
            interests,
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Profile saved successfully!');
        setIsEditing(false); 
      } else setMessage(data.message || 'Failed to save profile.');
    } catch {
      setMessage('Server error.');
    }
  };

  const removePhoto = () => setProfile((prev) => ({ ...prev, photo: '' }));

  return (
    <div className={styles.profileWrapper}>
      {/* Left panel with photo */}
      <div className={styles.leftPanel}>
        {profile.photo ? (
          <>
            <img src={profile.photo} alt="Profile" className={styles.avatar} />
            {isEditing && (
              <button
                type="button"
                onClick={removePhoto}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                }}
              >
                Remove Photo
              </button>
            )}
          </>
        ) : (
          <>
            <div className={styles.avatarPlaceholder}>👤</div>
            {isEditing && (
              <>
                <label
                  htmlFor="photoUpload"
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: '#3be374',
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    userSelect: 'none',
                  }}
                >
                  Upload Photo
                </label>
                <input
                  id="photoUpload"
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Right panel with form */}
      <div className={styles.rightPanel}>
        <h3 className={styles.sectionTitle}>Your Profile</h3>

        <div className={styles.formGroup}>
          <label>Name</label>
          {isEditing ? (
            <input type="text" name="name" value={profile.name} onChange={handleChange} />
          ) : (
            <p>{profile.name}</p>
          )}
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          ) : (
            <p>{profile.dob}</p>
          )}
          {errors.dob && <span className={styles.error}>{errors.dob}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          {isEditing ? (
            <input type="email" name="email" value={profile.email} onChange={handleChange} />
          ) : (
            <p>{profile.email}</p>
          )}
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Skills Known</label>
          {isEditing ? (
            <input
              type="text"
              name="skillsKnown"
              value={profile.skillsKnown}
              onChange={handleChange}
              placeholder="e.g. JavaScript, React, Node.js"
            />
          ) : (
            <p>{profile.skillsKnown}</p>
          )}
          {errors.skillsKnown && <span className={styles.error}>{errors.skillsKnown}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              rows="4"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
            />
          ) : (
            <p>{profile.bio}</p>
          )}
          {errors.bio && <span className={styles.error}>{errors.bio}</span>}
        </div>

        <div className={styles.buttonWrapper}>
          {isEditing ? (
            <button className={styles.saveButton} onClick={handleSave}>
              💾 Save
            </button>
          ) : (
            <button
              className={styles.saveButton}
              onClick={() => setIsEditing(true)}
              style={{ backgroundColor: '#1e90ff' }}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {message && (
          <p
            style={{
              marginTop: 10,
              color:
                message.toLowerCase().includes('fail') ||
                message.toLowerCase().includes('error')
                  ? 'red'
                  : 'green',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
