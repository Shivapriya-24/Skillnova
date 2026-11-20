import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PublicBadge.css';

export default function PublicBadge() {
  const { email, key } = useParams();
  const [badge, setBadge] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBadge() {
      try {
        const res = await axios.get(
          `http://localhost:5137/api/achievements/public/${encodeURIComponent(email)}/${encodeURIComponent(key)}`
        );
        setBadge(res.data);
      } catch (err) {
        setError('Badge not found.');
        console.error(err);
      }
    }
    loadBadge();
  }, [email, key]);

  if (error) return <div>{error}</div>;
  if (!badge) return <div>Loading…</div>;

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>{badge.title}</h1>
      <img
        className="badge-image"
        src={badge.icon || '/images/default-badge.svg'}
        alt={badge.title}
        style={{ width: '60px', height: '60px' , objectFit: 'contain' , borderRadius: '12px' }}
      />
      <p>{badge.description}</p>
      {badge.earnedAt && <small>Earned on {new Date(badge.earnedAt).toLocaleDateString()}</small>}
    </div>
  );
}
