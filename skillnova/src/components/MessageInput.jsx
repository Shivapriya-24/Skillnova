import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const send = () => {
    if (!text && !file) return;
    onSend({ content: text, file });
    setText('');
    setFile(null);
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center' }}>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <input
        style={{ flex: 1, margin: '0 0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ccc' }}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
        placeholder="Type a message..."
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
