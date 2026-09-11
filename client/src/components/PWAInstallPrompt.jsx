import { useEffect, useState } from "react";

/**
 * PWAInstallPrompt
 * Listens for the browser's beforeinstallprompt event and shows a styled
 * "Install App" banner once per session (stored in sessionStorage).
 */
function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pwa-banner" role="dialog" aria-label="Install app">
      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: "linear-gradient(135deg, #c9a227, #e2b84d)" }}
      >
        💰
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: "var(--text-heading)" }}>
          Install App
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Add to home screen for the full experience
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:brightness-110"
          style={{
            background: "linear-gradient(to right, #c9a227, #e2b84d)",
            color: "#000",
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-lg leading-none transition-all duration-200"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
