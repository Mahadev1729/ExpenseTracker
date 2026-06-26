import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

function ToastAlerts() {
  const { toasts, removeToast } = useContext(NotificationContext);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isWarning = toast.type === "budget" || toast.type === "warning";
        const isRecurring = toast.type === "recurring";
        
        let bgColor = "bg-white/95 backdrop-blur border-l-4 border-blue-500 text-gray-800";
        let icon = "ℹ️";
        
        if (isWarning) {
          bgColor = "bg-red-50/95 backdrop-blur border-l-4 border-red-500 text-red-950";
          icon = "⚠️";
        } else if (isRecurring) {
          bgColor = "bg-indigo-50/95 backdrop-blur border-l-4 border-indigo-500 text-indigo-950";
          icon = "📅";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded shadow-lg flex items-start gap-3 justify-between animate-slide-in transition-all duration-300 ${bgColor}`}
            style={{
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div className="flex gap-2">
              <span className="text-xl mt-0.5" role="img" aria-label="alert-icon">
                {icon}
              </span>
              <div>
                <h4 className="font-bold text-sm">{toast.title}</h4>
                <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition font-bold text-lg leading-none"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Add CSS keyframes for slide-in animation to style block or CSS file
// We'll also define it inline or ensure the app has tailwind classes.
export default ToastAlerts;
