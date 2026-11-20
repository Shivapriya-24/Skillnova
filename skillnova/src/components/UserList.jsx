import React from 'react';
import styles from '../styles/UserList.module.css';

export default function UserList({
  users = [],
  activeChatUser,
  setActiveChatUser,
  searchTerm,
  setSearchTerm,
  theme,
}) {
  const filteredUsers = users.filter((user) =>
    ((user.username || user.email) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.sidebar} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.userList}>
        {filteredUsers.length === 0 && <div className={styles.noUsers}>No users found</div>}
        {filteredUsers.map((user) => {
          const isActive = activeChatUser?.email === user.email;
          const displayName = user.username || user.email;
          return (
            <div key={user.email}
                 className={`${styles.userItem} ${isActive ? styles.active : ''}`}
                 onClick={() => setActiveChatUser(user)}>
              <div className={styles.avatar}>
                {user.avatarUrl ? <img src={user.avatarUrl} alt={displayName} /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
                <span className={`${styles.status} ${user.online ? styles.online : styles.offline}`} />
              </div>

              <div className={styles.userInfo}>
                <div className={styles.username}>{displayName}</div>
                <div className={styles.lastMessage}>{user.lastMessageText || ''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
