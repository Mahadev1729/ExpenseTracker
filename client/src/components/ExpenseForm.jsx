import { useState, useEffect, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import API from "../services/api";
import {
  getPendingCount,
  savePendingExpense,
  clearPendingExpenses,
  getPendingExpenses,
} from "../utils/offlineStorage";

function ExpenseForm({ refresh }) {
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

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="mb-4">
        <button
          onClick={listening ? stopListening : startListening}
          className="bg-green-500 text-white px-4 py-2 mr-2"
        >
          {listening ? "Stop Listening" : "🎤 Voice Input"}
        </button>
        <button
          onClick={processVoice}
          className="bg-blue-500 text-white px-4 py-2 mr-2"
        >
          Process Voice
        </button>
        <button
          onClick={resetTranscript}
          className="bg-gray-500 text-white px-4 py-2"
        >
          Reset
        </button>
      </div>

      <div className="mb-4">
        <p>Transcript: {transcript}</p>
      </div>

      <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-2 text-sm">
        <p>{isOnline ? "Online" : "Offline mode enabled"}</p>
        <p>
          {offlineCount > 0
            ? `${offlineCount} pending expense(s) will sync when online.`
            : "No pending expenses."}
        </p>
      </div>

      <form onSubmit={submit}>
        <input
          placeholder="Title"
          className="border p-2 mr-2"
          value={expense.title}
          onChange={(e) => setExpense({ ...expense, title: e.target.value })}
        />

        <input
          placeholder="Amount"
          type="number"
          className="border p-2 mr-2"
          value={expense.amount}
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
        />

        <select
          className="border p-2 mr-2"
          value={expense.category}
          onChange={(e) => setExpense({ ...expense, category: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 mr-2"
          value={expense.date}
          onChange={(e) => setExpense({ ...expense, date: e.target.value })}
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
