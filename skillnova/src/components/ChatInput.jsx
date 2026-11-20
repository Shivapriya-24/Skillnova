import React, { useState, useRef } from 'react';
import { FiSend, FiPaperclip, FiMic, FiXCircle } from 'react-icons/fi';

export default function ChatInput({
  newMsg,
  setNewMsg,
  onSendMessage,
  onSendAudio,
  selectedFile,
  setSelectedFile,
  theme,
}) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSendAudio(audioBlob);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #ccc',
        padding: '10px',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9f9f9',
      }}
    >
      <label style={{ cursor: 'pointer' }}>
        <FiPaperclip size={22} color={theme === 'dark' ? '#eee' : '#555'} />
        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>

      {selectedFile && (
        <div style={{
          display: 'flex', alignItems: 'center',
          background: theme === 'dark' ? '#374151' : '#e5e7eb',
          padding: '5px 10px', borderRadius: '15px', gap: '5px', maxWidth: '150px', overflow: 'hidden',
        }}>
          <span style={{ fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {selectedFile.name}
          </span>
          <FiXCircle size={18} style={{ cursor: 'pointer' }} onClick={() => setSelectedFile(null)} />
        </div>
      )}

      <textarea
        placeholder="Type a message"
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{
          flex: 1,
          borderRadius: '20px',
          border: '1px solid #ccc',
          padding: '10px 15px',
          fontSize: '16px',
          resize: 'none',
          outline: 'none',
          backgroundColor: theme === 'dark' ? '#374151' : '#fff',
          color: theme === 'dark' ? '#eee' : '#111',
        }}
      />

      <button
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
        style={{
          background: recording ? '#ef4444' : '#25D366',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title={recording ? 'Release to send voice note' : 'Hold to record voice note'}
      >
        <FiMic size={20} color="white" />
      </button>

      <button
        onClick={onSendMessage}
        disabled={!newMsg.trim() && !selectedFile}
        style={{
          backgroundColor: '#4f46e5',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: newMsg.trim() || selectedFile ? 'pointer' : 'not-allowed',
          opacity: newMsg.trim() || selectedFile ? 1 : 0.5,
        }}
      >
        <FiSend size={20} color="white" />
      </button>
    </div>
  );
}
