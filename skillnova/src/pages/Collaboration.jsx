import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/Collaboration.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5137';

const API = 'http://localhost:5137';

function FileList({ files }) {
  if (!files || files.length === 0) return null;
  return (
    <div className={styles.fileList}>
      {files.map((f, i) => {
        const link = f.url
          ? `${API_BASE}${f.url}`
          : `${API_BASE}/uploads/collaborations/${(f.path || '').split('/').pop()}`;
        return (
          <a
            key={i}
            href={link}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            {f.filename || `file-${i + 1}`}
          </a>
        );
      })}
    </div>
  );
}

export default function Collaboration() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const email = localStorage.getItem('userEmail') || '';
  const name = localStorage.getItem('userName') || '';

  const [view, setView] = useState('list');
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);

  const [newColl, setNewColl] = useState({
    title: '',
    short: '',
    description: '',
    tags: '',
    visibility: 'public',
  });
  const [newFiles, setNewFiles] = useState([]);

  const [current, setCurrent] = useState(null);
  const [joinMsg, setJoinMsg] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postFiles, setPostFiles] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatFiles, setChatFiles] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchList(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [current, refreshKey]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/collaborations/list`, {
        params: { q: q || undefined, tag: selectedTag || undefined },
      });
      setList(res.data.collaborations || []);
    } catch (e) {
      console.error('list fetch', e);
      alert('Failed to load collaborations');
    } finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!email) return alert('Please login to create');
    if (!newColl.title.trim()) return alert('Title required');
    try {
      const fd = new FormData();
      fd.append('title', newColl.title);
      fd.append('short', newColl.short);
      fd.append('description', newColl.description);
      fd.append('tags', newColl.tags);
      fd.append('visibility', newColl.visibility);
      fd.append('ownerEmail', email);
      fd.append('ownerName', name);
      newFiles.forEach(f => fd.append('files', f));

      const res = await axios.post(`${API}/api/collaborations/create`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });

      setNewColl({
        title: '', short: '', description: '', tags: '',
        visibility: 'public', meetLink: '', zoomLink: '', teamsLink: '',
      });
      setNewFiles([]);
      setView('detail');
      setCurrent(res.data.collaboration);
      fetchList();
    } catch (err) {
      console.error('create err', err);
      alert('Create failed');
    }
  }

  async function openDetail(id) {
    try {
      const res = await axios.get(`${API}/api/collaborations/${id}`);
      setCurrent(res.data.collaboration);
      setView('detail');
    } catch (err) {
      console.error('open error', err);
      alert('Failed to open collaboration');
    }
  }

  async function requestJoin(id) {
    if (!email) return alert('Please login to request join');
    try {
      await axios.post(`${API}/api/collaborations/${id}/join`,
        { email, name, message: joinMsg });
      alert('Join request sent');
      setJoinMsg('');
      setRefreshKey(s => s + 1);
    } catch (err) {
      console.error('join err', err);
      alert(err?.response?.data?.error || 'Join failed');
    }
  }

  async function approveMember(id, memberEmail, accept) {
    try {
      await axios.post(`${API}/api/collaborations/${id}/members/approve`,
        { email: memberEmail, approverEmail: email, accept });
      openDetail(id);
    } catch (err) {
      console.error('approve err', err);
      alert('Action failed');
    }
  }

  async function createPost() {
    if (!email) return alert('login');
    if (!postTitle.trim() && !postBody.trim()) return alert('title or body required');
    try {
      const fd = new FormData();
      fd.append('authorEmail', email);
      fd.append('authorName', name);
      fd.append('title', postTitle);
      fd.append('body', postBody);
      postFiles.forEach(f => fd.append('files', f));
      await axios.post(`${API}/api/collaborations/${current._id}/posts`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      setPostTitle(''); setPostBody(''); setPostFiles([]);
      openDetail(current._id);
    } catch (err) {
      console.error(err);
      alert('Post failed');
    }
  }

  async function sendMessage() {
    if (!email) return alert('login');
    if (!chatText.trim() && chatFiles.length === 0) return alert('enter message or attach files');
    try {
      const fd = new FormData();
      fd.append('senderEmail', email);
      fd.append('senderName', name);
      fd.append('text', chatText);
      chatFiles.forEach(f => fd.append('files', f));
      await axios.post(`${API}/api/collaborations/${current._id}/messages`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      setChatText(''); setChatFiles([]);
      setRefreshKey(k => k + 1);
      openDetail(current._id);
    } catch (err) {
      console.error(err);
      alert('Send failed');
    }
  }

  async function deleteCollab() {
    if (!window.confirm('Delete this collaboration?')) return;
    try {
      await axios.delete(`${API}/api/collaborations/${current._id}`, {
        data: { email },
      });
      alert('Deleted');
      setView('list');
      setCurrent(null);
      fetchList();
    } catch (err) {
      console.error('delete', err);
      alert('Delete failed');
    }
  }

  function publicUrlFor(id) {
    return `${window.location.origin}/collaboration/public/${id}`;
  }

  if (view === 'create') {
    return (
      <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.container}>
          <h2>Create Collaboration</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <input value={newColl.title} onChange={e => setNewColl({ ...newColl, title: e.target.value })} placeholder="Title" />
            <input value={newColl.short} onChange={e => setNewColl({ ...newColl, short: e.target.value })} placeholder="Short summary" />
            <textarea value={newColl.description} onChange={e => setNewColl({ ...newColl, description: e.target.value })} placeholder="Describe the collaboration" />
            <input value={newColl.tags} onChange={e => setNewColl({ ...newColl, tags: e.target.value })} placeholder="tags,comma,separated" />
            <select value={newColl.visibility} onChange={e => setNewColl({ ...newColl, visibility: e.target.value })}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <label className={styles.uploadLabel}>
              Attach files
              <input type="file" multiple onChange={e => setNewFiles([...e.target.files])} />
            </label>
            {newFiles.length > 0 && <div className={styles.smallList}>{newFiles.map(f => <div key={f.name}>{f.name}</div>)}</div>}
            <div className={styles.actions}>
              <button type="submit">Create</button>
              <button type="button" onClick={() => setView('list')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'detail' && current) {
    const isOwner = current.ownerEmail === email;
    const member = current.members?.find(m => m.email === email);
    const isMember = !!member && member.role !== 'requested';
    return (
      <div className={`${styles.page} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.headerRow}>
          <button onClick={() => { setView('list'); setCurrent(null); }}>{'< Back'}</button>
          <h2>{current.title}</h2>
          <div>
            <a href={publicUrlFor(current._id)} target="_blank" rel="noopener noreferrer">Public link</a>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>
            <div className={styles.card}>
              <h3>About</h3>
              <p>{current.short}</p>
              <p>{current.description}</p>
              <div className={styles.tagRow}>{(current.tags || []).map(tg => <span key={tg} className={styles.tag}>{tg}</span>)}</div>
              <p>Owner: {current.ownerName || current.ownerEmail}</p>

              <FileList files={current.attachments} />
            </div>

            <div className={styles.card}>
              <h3>Members</h3>
              <ul>
                {(current.members || []).map(m => (
                  <li key={m.email}>
                    {m.name || m.email} — {m.role}
                    {m.role === 'requested' && isOwner && (
                      <span className={styles.memberActions}>
                        <button onClick={() => approveMember(current._id, m.email, true)}>Accept</button>
                        <button onClick={() => approveMember(current._id, m.email, false)}>Reject</button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {!isMember && current.visibility === 'public' && (
                <div className={styles.joinBox}>
                  <textarea placeholder="Message for owner (optional)" value={joinMsg} onChange={e => setJoinMsg(e.target.value)} />
                  <button onClick={() => requestJoin(current._id)}>Request to join</button>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h3>Posts</h3>
              <div className={styles.formRow}>
                <input placeholder="Post title" value={postTitle} onChange={e => setPostTitle(e.target.value)} />
                <textarea placeholder="Write a post..." value={postBody} onChange={e => setPostBody(e.target.value)} />
                <input type="file" multiple onChange={e => setPostFiles([...e.target.files])} />
                <div className={styles.actions}><button onClick={createPost}>Post</button></div>
              </div>

              {(current.posts || []).map(p => (
                <div key={p._id || p.createdAt} className={styles.post}>
                  <b>{p.title}</b>
                  <p>{p.body}</p>
                  <small>By {p.authorName || p.authorEmail} • {new Date(p.createdAt).toLocaleString()}</small>
                  <FileList files={p.attachments} />
                </div>
              ))}
            </div>
          </div>

         <div className={styles.column}>
            <div className={styles.card}>
              <h3>Chat</h3>
              <div className={styles.chatBox}>
                {(current.messages || []).map((m, i) => (
                  <div key={i}>
                    <b>{m.senderName || m.senderEmail}</b>{' '}
                    <small>{new Date(m.createdAt).toLocaleString()}</small>
                    <div>{m.text}</div>
                    {m.attachments?.length > 0 && (
                      <div>
                      {m.attachments.map((a, k) => {
                        const link = a.url
                        ? `${API_BASE}${a.url}`
                        : `${API_BASE}/uploads/collaborations/${(a.path || '').split('/').pop()}`;
                        return (
                          <a
                          key={k}
                          href={link}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                        {a.filename || `file-${k + 1}`}
                        </a>
                        );
                      })}
                    </div>
                  )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.formRow}>
                <textarea placeholder="Write a message..." value={chatText} onChange={e => setChatText(e.target.value)} />
                <input type="file" multiple onChange={e => setChatFiles([...e.target.files])} />
                <div className={styles.actions}>
                  <button onClick={sendMessage}>Send</button>
                  <button onClick={() => { setChatText(''); setChatFiles([]); }}>Clear</button>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Quick actions</h3>
              <button onClick={() => window.open(publicUrlFor(current._id), '_blank')}>Open public view</button>
              <button onClick={() => { navigator.clipboard?.writeText(publicUrlFor(current._id)); alert('Link copied'); }}>Copy public link</button>
              {isOwner && <button onClick={deleteCollab} className={styles.deleteBtn}>Delete Collaboration</button>}
              <button onClick={() => { setView('list'); setCurrent(null); }}>Back to list</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.headerRow}>
        <h2>Collaborations</h2>
        <div><button onClick={() => setView('create')}>+ Create</button></div>
      </div>

      <div className={styles.filterRow}>
        <input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
        <input placeholder="Tag" value={selectedTag} onChange={e => setSelectedTag(e.target.value)} />
        <button onClick={fetchList}>Search</button>
      </div>

      {loading ? <div>Loading…</div> : (
        <div className={styles.gridList}>
          {list.map(c => (
            <div key={c.id} className={styles.cardMini}>
              <h3>{c.title}</h3>
              <p className={styles.short}>{c.short}</p>
              <div className={styles.tagRow}>{(c.tags || []).map(tg => <span key={tg} className={styles.tag}>{tg}</span>)}</div>
              <div className={styles.cardFooter}>
                <button onClick={() => openDetail(c.id)}>Open</button>
                <a href={publicUrlFor(c.id)} target="_blank" rel="noopener noreferrer">Public</a>
              </div>
            </div>
          ))}
          {list.length === 0 && <div>No collaborations found</div>}
        </div>
      )}
    </div>
  );
}
