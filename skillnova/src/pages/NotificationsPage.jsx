import React, { useEffect, useState, useMemo, useContext } from "react";
import { io } from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import styles from "../styles/NotificationsPage.module.css";
import { FaEnvelope, FaUsers, FaChalkboardTeacher, FaCog } from "react-icons/fa";
import {
  getNotifications,
  markAsRead,
  markAsUnread,
  markAllRead,
  deleteNotification,
} from "../services/notificationsApi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5137";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;

const iconMap = {
  messages: <FaEnvelope />,
  collaboration: <FaUsers />,
  session: <FaChalkboardTeacher />,
  system: <FaCog />,
  default: <FaEnvelope />,
};

export default function NotificationsPage() {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndConnect = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) throw new Error("User not logged in");
        setUserId(email);

        const socket = io(SOCKET_URL, { transports: ["websocket"] });
        socket.emit("identify", email);

        socket.on("notification:new", (n) =>
          setNotifications((p) => [{ ...n, type: n.type?.toLowerCase() }, ...p])
        );
        socket.on("notification:update", (n) =>
          setNotifications((p) =>
            p.map((x) => (x._id === n._id ? { ...n, type: n.type?.toLowerCase() } : x))
          )
        );

        return () => socket.close();
      } catch (err) {
        console.error("Failed to fetch user info", err);
        alert("Failed to fetch user info. Please login.");
      }
    };
    fetchUserAndConnect();
  }, []);

  useEffect(() => {
    if (userId) fetchList(userId);
  }, [userId]);

  const fetchList = async (uid) => {
    try {
      setLoading(true);
      const res = await getNotifications(uid);
      const normalized = (res.data.notifications || []).map((n) => ({
        ...n,
        type: n.type?.toLowerCase() || "default",
      }));
      setNotifications(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return notifications
      .filter((n) => {
        const nType = n.type?.toLowerCase() || "default";
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return nType === filter;
      })
      .filter((n) =>
        (n.title + n.message).toLowerCase().includes(search.toLowerCase())
      );
  }, [notifications, filter, search]);

  const toggleRead = async (id, read) => {
    try {
      read ? await markAsUnread(id) : await markAsRead(id);
      setNotifications((p) =>
        p.map((n) => (n._id === id ? { ...n, read: !read } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllReadHandler = async () => {
    if (!userId) return;
    try {
      await markAllRead(userId);
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h1 className={styles.heading}>Notifications</h1>

          <div className={styles.filters}>
            {["all", "unread", "session", "collaboration", "messages", "system"].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ""}`}
                onClick={() => setFilter(f)}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />

            <button className={styles.filterBtn} onClick={markAllReadHandler}>
              Mark all read
            </button>
          </div>

          {loading ? (
            <div>Loading…</div>
          ) : filtered.length === 0 ? (
            <div>No {filter !== "all" ? filter : ""} notifications available</div>
          ) : (
            <div className={styles.list}>
              {filtered.map((n) => (
                <div
                  key={n._id}
                  className={`${styles.notificationItem} ${n.read ? styles.read : ""}`}
                >
                  <div className={styles.notificationHeader}>
                    <span className={styles.icon}>{iconMap[n.type] || iconMap.default}</span>
                    <strong>
                      {n.title ||
                        (n.type
                          ? n.type.charAt(0).toUpperCase() + n.type.slice(1)
                          : "Notification")}
                    </strong>
                    <div className={styles.actionButtons}>
                      <button className={styles.markBtn} onClick={() => toggleRead(n._id, n.read)}>
                        {n.read ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={async () => {
                          await deleteNotification(n._id);
                          setNotifications((p) => p.filter((x) => x._id !== n._id));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className={styles.notifyMessage}>{n.message}</p>
                  <div className={styles.notifyDate}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
