import { useState, useEffect, useCallback, useContext } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import API from "../../services/api";
import {
  getPendingCount,
  savePendingExpense,
  clearPendingExpenses,
  getPendingExpenses,
} from "../../utils/offlineStorage";
import { ShimmerExpenseForm } from "../shared/Shimmer";
import { NotificationContext } from "../../context/NotificationContext";
import { formatCategoryLabel } from "../../utils/categoryIcons";

function ExpenseForm({ refresh, isLoading = false }) {
  if (isLoading) {
    return <ShimmerExpenseForm />;
  }
  const { addToast } = useContext(NotificationContext);
  const [categories, setCategories] = useState([]);
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [offlineCount, setOfflineCount] = useState(getPendingCount());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data);
      if (response.data.length > 0) {
        setExpense((prev) => ({
          ...prev,
          category: response.data[0].name,
        }));
      }
    } catch (error) {
      console.error("Error fetching categories in ExpenseForm:", error);
    }
  }, []);

  const syncPendingExpenses = useCallback(async () => {
    const pending = getPendingExpenses();
    if (!pending.length || !navigator.onLine) return;

    try {
      for (const item of pending) {
        await API.post("/expenses", item);
      }
      clearPendingExpenses();
      setOfflineCount(0);
      refresh();
    } catch (error) {
      console.error("Failed to sync pending expenses:", error);
    }
  }, [refresh]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncPendingExpenses();
      }
    };

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, [syncPendingExpenses]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });

  const stopListening = () => SpeechRecognition.stopListening();

  const processVoice = () => {
    const text = transcript.toLowerCase();
    let amount = "";
    let category = "Others";
    let title = "";

    const amountMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
    if (amountMatch) {
      amount = amountMatch[1];
    }

    const categories = [
      { keys: ["food", "groceries", "dining"], name: "Food" },
      { keys: ["travel", "transport"], name: "Travel" },
      { keys: ["shopping", "clothes"], name: "Shopping" },
      { keys: ["bills", "utilities"], name: "Bills" },
    ];

    for (const c of categories) {
      if (c.keys.some((k) => text.includes(k))) {
        category = c.name;
        break;
      }
    }

    const titleMatch = text.match(
      /(?:for|at|on|about|regarding)\s+(.+?)(?:\s+(?:for|at|on|\$|\d)|$)/,
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      let temp = text;
      if (amountMatch) temp = temp.replace(amountMatch[0], "");
      temp = temp.replace(
        /\b(food|groceries|dining|travel|transport|shopping|clothes|bills|utilities)\b/g,
        "",
      );
      temp = temp.replace(
        /\b(spent|spent on|bought|purchase|purchased|paid|for|on|at|about|regarding)\b/g,
        "",
      );
      temp = temp.replace(/[^a-z0-9\s]/g, "");
      title = temp.trim();

      if (!title) title = transcript.trim();
    }

    const today = new Date().toISOString().split("T")[0];

    setExpense((prev) => ({
      ...prev,
      title: title || prev.title,
      amount: amount || prev.amount,
      category,
      date: today,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (parseFloat(expense.amount) < 0) {
      addToast(
        "Invalid Amount",
        "Amount cannot be negative. Please enter a valid positive amount.",
        "warning"
      );
      return;
    }

    const payload = { ...expense };

    try {
      if (!navigator.onLine) {
        savePendingExpense(payload);
        setOfflineCount(getPendingCount());
        setExpense({
          title: "",
          amount: "",
          category: categories[0]?.name || "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        return;
      }

      await API.post("/expenses", payload);
      setExpense({
        title: "",
        amount: "",
        category: categories[0]?.name || "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      refresh();
    } catch (error) {
      console.error("Error saving expense:", error);
      savePendingExpense(payload);
      setOfflineCount(getPendingCount());
    }
  };

  return (
    <div className="premium-card p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>
          ➕ Log New Expense
        </h3>
        {browserSupportsSpeechRecognition && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              className="rounded-full bg-gradient-to-r from-[#c9a227] to-[#e2b84d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-black hover:brightness-110 transition"
            >
              {listening ? "⏹️ Stop Listening" : "🎤 Voice Input"}
            </button>
            {transcript && (
              <>
                <button
                  type="button"
                  onClick={processVoice}
                  className="rounded-full border border-white/10 bg-[#1b1b1b] px-3.5 py-1.5 text-xs sm:text-sm text-white hover:bg-white/10 transition"
                >
                  ⚡ Process Voice
                </button>
                <button
                  type="button"
                  onClick={resetTranscript}
                  className="rounded-full bg-gray-800 px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white transition"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {browserSupportsSpeechRecognition && transcript && (
        <div className="mb-4 p-3 rounded-xl bg-black/20 border border-white/10 text-xs sm:text-sm text-gray-300">
          <span className="font-semibold text-white">Transcript:</span> {transcript}
        </div>
      )}

      <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs sm:text-sm text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-amber-500"}`}></span>
          <span>{isOnline ? "Online Mode" : "Offline Mode Enabled"}</span>
        </div>
        <div>
          {offlineCount > 0
            ? `${offlineCount} pending expense(s) will sync automatically.`
            : "All expenses synced."}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Title
            </label>
            <input
              placeholder="e.g. Groceries"
              className="w-full premium-input px-3.5 py-2.5 text-sm"
              value={expense.title}
              onChange={(e) => setExpense({ ...expense, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Amount (₹)
            </label>
            <input
              placeholder="0.00"
              type="number"
              step="0.01"
              className="w-full premium-input px-3.5 py-2.5 text-sm"
              value={expense.amount}
              onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Category
            </label>
            <select
              className="w-full premium-input px-3.5 py-2.5 text-sm"
              value={expense.category}
              onChange={(e) => setExpense({ ...expense, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {formatCategoryLabel(c.icon, c.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Date
            </label>
            <input
              type="date"
              className="w-full premium-input px-3.5 py-2.5 text-sm"
              value={expense.date}
              onChange={(e) => setExpense({ ...expense, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black font-semibold text-sm hover:brightness-110 shadow-[0_8px_20px_rgba(201,162,39,0.2)] transition duration-200"
          >
            + Add Expense
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
