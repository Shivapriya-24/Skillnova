import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5137/api/admin';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminEmail = localStorage.getItem('adminEmail');

  useEffect(() => {
    if (!adminEmail) {
      alert('Please login as admin to continue.');
      window.location.href = '/admin-login';
    }
  }, [adminEmail]);

  const withAuth = (url) => `${url}?email=${encodeURIComponent(adminEmail)}`;

  const fetchData = async (url, setter) => {
    try {
      const res = await fetch(withAuth(url));
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminEmail) return;
    fetchData(`${API_URL}/users`, setUsers);
    fetchData(`${API_URL}/skills`, setSkills);
    fetchData(`${API_URL}/sessions`, setSessions);
    fetchData(`${API_URL}/feedback`, setFeedbacks);
    fetchData(`${API_URL}/achievements`, setAchievements);
    fetchData(`${API_URL}/contacts`, setContacts);
    fetchData(`${API_URL}/collaborations`, setCollaborations);
    fetchData(`${API_URL}/notifications`, setNotifications);
  }, [adminEmail]);

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'skills', label: 'Skills' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'feedbacks', label: 'Feedbacks' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'collaborations', label: 'Collaborations' },
    { key: 'notifications', label: 'Notifications' },
  ];

  if (loading) return <div style={{ padding: '40px' }}>Loading admin data...</div>;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>SkillNova Admin</h2>
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('adminEmail');
            window.location.href = '/admin-login';
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>{tabs.find((t) => t.key === activeTab)?.label}</h1>

        {/* USERS */}
        {activeTab === 'users' && (
          <table>
            <thead>
              <tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.length ? users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : <tr><td colSpan="4">No users found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* SKILLS */}
        {activeTab === 'skills' && (
          <table>
            <thead><tr><th>Skill</th><th>Owner</th></tr></thead>
            <tbody>
              {skills.length ? skills.map((s) => (
                <tr key={s._id}>
                  <td>{s.skill || s.skillName || '—'}</td>
                  <td>{s.owner || 'N/A'}</td>
                </tr>
              )) : <tr><td colSpan="2">No skills found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* SESSIONS */}
        {activeTab === 'sessions' && (
          <table>
            <thead>
              <tr><th>Requester</th><th>Teacher</th><th>Skill</th><th>Status</th><th>Scheduled</th></tr>
            </thead>
            <tbody>
              {sessions.length ? sessions.map((s) => (
                <tr key={s._id}>
                  <td>{s.requester || 'Unknown'}</td>
                  <td>{s.teacher || 'Unknown'}</td>
                  <td>{s.skill || '—'}</td>
                  <td>{s.status || '—'}</td>
                  <td>{s.scheduledDate || '—'}</td>
                </tr>
              )) : <tr><td colSpan="5">No sessions found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* FEEDBACKS */}
        {activeTab === 'feedbacks' && (
          <table>
            <thead><tr><th>From</th><th>To</th><th>Rating</th><th>Comments</th></tr></thead>
            <tbody>
              {feedbacks.length ? feedbacks.map((f) => (
                <tr key={f._id}>
                  <td>{f.from || 'Unknown'}</td>
                  <td>{f.to || 'Unknown'}</td>
                  <td>{f.rating || '—'}</td>
                  <td>{f.comments || f.comment || ''}</td>
                </tr>
              )) : <tr><td colSpan="4">No feedback found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <table>
            <thead><tr><th>Title</th><th>Description</th><th>User</th></tr></thead>
            <tbody>
              {achievements.length ? achievements.map((a) => (
                <tr key={a._id}>
                  <td>{a.title || '—'}</td>
                  <td>{a.description || '—'}</td>
                  <td>{a.user || 'N/A'}</td>
                </tr>
              )) : <tr><td colSpan="3">No achievements found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* CONTACTS */}
        {activeTab === 'contacts' && (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Message</th></tr></thead>
            <tbody>
              {contacts.length ? contacts.map((c) => (
                <tr key={c._id}>
                  <td>{c.name || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.message || ''}</td>
                </tr>
              )) : <tr><td colSpan="3">No contacts found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* COLLABORATIONS */}
        {activeTab === 'collaborations' && (
          <table>
            <thead><tr><th>Title</th><th>Created By</th><th>Category</th></tr></thead>
            <tbody>
              {collaborations.length ? collaborations.map((c) => (
                <tr key={c._id}>
                  <td>{c.title || '—'}</td>
                  <td>{c.createdBy || 'Unknown'}</td>
                  <td>{c.category || 'N/A'}</td>
                </tr>
              )) : <tr><td colSpan="3">No collaborations found.</td></tr>}
            </tbody>
          </table>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <table>
            <thead><tr><th>Title</th><th>Message</th><th>Date</th></tr></thead>
            <tbody>
              {notifications.length ? notifications.map((n) => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan="3">No notifications found.</td></tr>}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
