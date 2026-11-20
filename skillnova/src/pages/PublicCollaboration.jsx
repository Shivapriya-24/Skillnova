import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5137';

export default function PublicCollaboration() {
  const { id } = useParams();
  const [coll, setColl] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE}/api/collaborations/public/${id}`)
      .then(res => setColl(res.data))
      .catch(e =>
        setErr(e.response?.data?.error || 'Collaboration not found')
      );
  }, [id]);

  if (err) return <div>{err}</div>;
  if (!coll) return <div>Loading…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{coll.title}</h1>
      <p>{coll.short}</p>
      <p>{coll.description}</p>
      <div>
        {(coll.tags || []).map(t => (
          <span key={t} style={{ marginRight: 6 }}>{t}</span>
        ))}
      </div>

      {/* ----------- TOP-LEVEL ATTACHMENTS ----------- */}
      <h3>Attachments</h3>
      {coll.attachments?.length ? (
        coll.attachments.map((a, i) => (
          <div key={i}>
            <a
              href={`${API_BASE}${a.url}`}
              download={a.filename}
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.filename}
            </a>
          </div>
        ))
      ) : (
        <p>No attachment yet</p>
      )}

      {/* ⭐ NEW: POST ATTACHMENTS */}
      {coll.posts?.length > 0 && (
        <>
          <h3>Post Attachments</h3>
          {coll.posts.map((p, i) => (
            <div key={p._id || i} style={{marginBottom:12}}>
              <strong>{p.title}</strong>
              {p.attachments?.map((f, k) => (
                <div key={k}>
                  <a
                    href={`${API_BASE}${f.url}`}
                    download={f.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {f.filename || `file-${k + 1}`}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* ⭐ NEW: CHAT / MESSAGE ATTACHMENTS */}
      {coll.messages?.length > 0 && (
        <>
          <h3>Chat Attachments</h3>
          {coll.messages.map((m, i) => (
            m.attachments?.length ? (
              <div key={i} style={{marginBottom:12}}>
                <strong>{m.senderName || m.senderEmail}</strong>
                {m.attachments.map((a, k) => (
                  <div key={k}>
                    <a
                      href={`${API_BASE}${a.url}`}
                      download={a.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {a.filename || `file-${k + 1}`}
                    </a>
                  </div>
                ))}
              </div>
            ) : null
          ))}
        </>
      )}

      <h3>Members</h3>
      {coll.members?.length ? (
        coll.members.map(m => (
          <div key={m.email}>{m.name || m.email} — {m.role}</div>
        ))
      ) : (
        <p>No members yet</p>
      )}
    </div>
  );
}
