import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker with update callback
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a subtle update notification to the user
    const confirmed = window.confirm(
      "A new version of Smart Expense Tracker is available. Refresh now to update?"
    );
    if (confirmed) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("✅ App is ready for offline use.");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
