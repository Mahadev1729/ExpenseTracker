import { useState, useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../../context/NotificationContext";

function NotificationInbox() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    refresh
  } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh notifications on open
  const handleToggle = () => {
    if (!isOpen) {
      refresh();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Trigger */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse text-[10px]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-xl shadow-2xl py-1 z-50 animate-fade-up"
          style={{
            backgroundColor: "var(--bg-sidebar)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            className="px-4 py-2 flex justify-between items-center rounded-t-xl"
            style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
          >
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-heading)" }}>Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-medium transition"
                style={{ color: "#ef4444" }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <span className="text-3xl block mb-2">🎉</span>
                All caught up!
              </div>
            ) : (
              notifications.map((n) => {
                const isBudget = n.type === "budget";
                const isRecurring = n.type === "recurring";
                
                let icon = "ℹ️";
                let iconBg = "rgba(59,130,246,0.12)";
                
                if (isBudget) {
                  icon = "⚠️";
                  iconBg = "rgba(239,68,68,0.12)";
                } else if (isRecurring) {
                  icon = "📅";
                  iconBg = "rgba(99,102,241,0.12)";
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition ${
                      !n.is_read ? "" : ""
                    }`}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: !n.is_read ? "var(--accent-soft)" : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-card-hover)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.is_read ? "var(--accent-soft)" : "transparent"}
                  >
                    <div
                      className="p-2 rounded-full text-base flex items-center justify-center shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={`text-xs font-semibold truncate`}
                          style={{ color: !n.is_read ? "var(--text-heading)" : "var(--text-secondary)" }}
                        >
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                        {formatTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationInbox;
