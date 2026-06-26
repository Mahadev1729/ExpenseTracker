import { createContext, useState, useEffect, useContext, useCallback } from "react";
import API from "../services/api";
import { AuthContext } from "./context";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto-remove toast after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get("/notifications");
      setNotifications((prev) => {
        const prevIds = new Set(prev.map((n) => n.id));
        const newUnread = res.data.filter((n) => !n.is_read && !prevIds.has(n.id));
        
        // Trigger a visual toast notification for each new unread item detected
        newUnread.forEach((n) => {
          addToast(n.title, n.message, n.type);
        });

        return res.data;
      });
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live background notification updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const clearAll = async () => {
    try {
      await API.delete("/notifications");
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        clearAll,
        refresh: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
