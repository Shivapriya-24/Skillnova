import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5137";

export const getNotifications = async (userEmail) => {
  if (!userEmail) throw new Error("User not logged in");
  return axios.get(`${API_BASE}/api/notifications/${userEmail}`);
};

export const markAsRead = async (id) => {
  return axios.post(`${API_BASE}/api/notifications/read/${id}`);
};

export const markAsUnread = async (id) => {
  return axios.post(`${API_BASE}/api/notifications/unread/${id}`);
};

export const markAllRead = async (userEmail) => {
  if (!userEmail) throw new Error("User not logged in");
  return axios.post(`${API_BASE}/api/notifications/mark-all-read/${userEmail}`);
};

export const deleteNotification = async (id) => {
  return axios.delete(`${API_BASE}/api/notifications/${id}`);
};
