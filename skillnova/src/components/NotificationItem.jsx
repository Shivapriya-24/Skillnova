import React from "react";
import styles from "../styles/NotificationItem.module.css";

export default function NotificationItem({ n, onToggleRead, onDelete }) {
  return (
    <div
      className={`${styles.item} ${n.read ? styles.read : styles.unread}`}
    >
      <div className={styles.header}>
        <span className={styles.title}>{n.title}</span>
        <span className={styles.type}>{n.type}</span>
      </div>
      <div className={styles.message}>{n.message}</div>
      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date(n.createdAt).toLocaleString()}
        </span>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={onToggleRead}>
            {n.read ? "Mark Unread" : "Mark Read"}
          </button>
          <button className={styles.actionBtnDelete} onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
