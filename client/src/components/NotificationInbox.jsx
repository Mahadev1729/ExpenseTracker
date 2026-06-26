import { useState, useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../context/NotificationContext";

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
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-100 py-1 z-50 text-gray-800">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-700 text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
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
                let iconBg = "bg-blue-100";
                
                if (isBudget) {
                  icon = "⚠️";
                  iconBg = "bg-red-100";
                } else if (isRecurring) {
                  icon = "📅";
                  iconBg = "bg-indigo-100";
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 cursor-pointer transition ${
                      !n.is_read ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-full ${iconBg} text-base flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs font-semibold truncate ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xxs text-gray-500 text-[11px] mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
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
