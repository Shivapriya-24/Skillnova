import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { socket } from '../services/socket';
import UserList from '../components/UserList';
import ChatInput from '../components/ChatInput';
import styles from '../styles/Messages.module.css';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const API = 'http://localhost:5137';

export default function Messages({ currentUserEmail }) {
  const { theme } = useContext(ThemeContext);     
  const { t } = useContext(LanguageContext);      

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUserEmail) return;
    socket.emit('join', currentUserEmail);

    const handler = (message) => {
      if (
        activeChatUser &&
        ((message.sender === currentUserEmail &&
          message.receiver === activeChatUser.email) ||
         (message.sender === activeChatUser.email &&
          message.receiver === currentUserEmail))
      ) {
        setMessages(prev =>
          prev.some(m => m._id === message._id) ? prev : [...prev, message]
        );
      }
    };

    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [currentUserEmail, activeChatUser]);

  useEffect(() => {
    if (!currentUserEmail) return;
    axios
      .get(`${API}/api/users`)
      .then(res => {
        const list = Array.isArray(res.data?.users) ? res.data.users : [];
        setUsers(list.filter(u => u.email !== currentUserEmail));
      })
      .catch(err => console.error('Error fetching users:', err));
  }, [currentUserEmail]);

  useEffect(() => {
    if (!activeChatUser || !currentUserEmail) return;
    (async () => {
      try {
        const res = await axios.get(
          `${API}/api/conversations?email=${currentUserEmail}`
        );
        const conv = Array.isArray(res.data)
          ? res.data.find(c => c.withUserEmail === activeChatUser.email)
          : null;

        if (!conv) return setMessages([]);
        const msgsRes = await axios.get(
          `${API}/api/conversations/${conv.id}/messages`
        );
        setMessages(msgsRes.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      }
    })();
  }, [activeChatUser, currentUserEmail]);

  const toFullUrl = (url) => (url?.startsWith('http') ? url : `${API}${url}`);

  const handleSendMessage = async () => {
    if (!newMsg.trim() && !selectedFile) return;
    if (!activeChatUser) return;

    const formData = new FormData();
    formData.append('sender', currentUserEmail);
    formData.append('receiver', activeChatUser.email);
    if (newMsg.trim()) formData.append('text', newMsg.trim());
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const res = await axios.post(`${API}/api/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      socket.emit('send-message', res.data.message);
      setNewMsg('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSendAudio = async (audioBlob) => {
    if (!activeChatUser) return;
    const formData = new FormData();
    formData.append('sender', currentUserEmail);
    formData.append('receiver', activeChatUser.email);
    formData.append('audio', audioBlob, 'voice-note.webm');
    try {
      await axios.post(`${API}/api/messages/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Error sending audio:', err);
    }
  };

  const handleClearChat = async () => {
    if (!activeChatUser) return;
    if (!window.confirm(t('messages.confirmClear') || 'Clear all messages?')) return;
    try {
      const convRes = await axios.get(
        `${API}/api/conversations?email=${currentUserEmail}`
      );
      const conv = convRes.data.find(
        (c) => c.withUserEmail === activeChatUser.email
      );
      if (!conv) return;
      await axios.delete(`${API}/api/conversations/${conv.id}/messages`);
      setMessages([]);
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };

  return (
    <div
      className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}
    >
      <div className={styles.chatCard}>
        <UserList
          users={users}
          activeChatUser={activeChatUser}
          setActiveChatUser={setActiveChatUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          theme={theme}
        />

        <div className={styles.chatMain}>
          {activeChatUser ? (
            <>
              <div className={styles.chatHeader}>
                <div>
                  <h2>{activeChatUser.username || activeChatUser.email}</h2>
                  <small>{activeChatUser.email}</small>
                </div>
                <button
                  onClick={handleClearChat}
                  className={styles.clearBtn}
                  title={t('messages.clearChat') || 'Clear Chat'}
                >
                  {t('messages.clearChat') || 'Clear Chat'}
                </button>
              </div>

              <div className={styles.chatMessages}>
                {messages.length === 0 && (
                  <p className={styles.noMessages}>
                    {t('messages.noMessages') || 'No messages yet.'}
                  </p>
                )}
                {messages.map((msg, idx) => {
                  const isSender = msg.sender === currentUserEmail;
                  const sentClass = isSender ? styles.sent : styles.received;
                  return (
                    <div
                      key={idx}
                      className={`${styles.messageRow} ${sentClass}`}
                    >
                      <div className={styles.messageBubble}>
                        {msg.audioUrl ? (
                          <audio controls src={toFullUrl(msg.audioUrl)} />
                        ) : msg.fileUrl ? (
                          <a
                            href={toFullUrl(msg.fileUrl)}
                            download={msg.fileName || 'file'}
                            className={styles.fileAttachment}
                          >
                            📎 {msg.fileName || t('messages.attachment')}
                          </a>
                        ) : (
                          msg.text
                        )}
                        <div className={styles.timestamp}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <ChatInput
                newMsg={newMsg}
                setNewMsg={setNewMsg}
                onSendMessage={handleSendMessage}
                onSendAudio={handleSendAudio}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                theme={theme}
              />
            </>
          ) : (
            <div className={styles.selectPrompt}>
              <p>{t('messages.selectUser') || 'Select a user to start chatting'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
