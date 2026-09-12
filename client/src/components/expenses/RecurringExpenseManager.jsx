import { useState, useEffect } from "react";
import API from "../../services/api";
import { ShimmerList } from "../shared/Shimmer";

function RecurringExpenseManager() {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    frequency: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchRecurringExpenses(), fetchCategories()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecurringExpenses = async () => {
    try {
      const response = await API.get("/recurring-expenses");
      setRecurringExpenses(response.data);
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (isLoading) {
    return <ShimmerList items={5} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/recurring-expenses/${editingId}`, formData);
      } else {
        await API.post("/recurring-expenses", formData);
      }
      fetchRecurringExpenses();
      setShowForm(false);
      setFormData({
        title: "",
        amount: "",
        category: "",
        frequency: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        notes: "",
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving recurring expense:", error);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
      start_date: expense.start_date,
      end_date: expense.end_date || "",
      notes: expense.notes || "",
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this recurring expense?")
    ) {
      try {
        await API.delete(`/recurring-expenses/${id}`);
        fetchRecurringExpenses();
      } catch (error) {
        console.error("Error deleting recurring expense:", error);
      }
    }
  };

  const processRecurringExpenses = async () => {
    try {
      const response = await API.post("/recurring-expenses/process");
      alert(`${response.data.message}`);
      fetchRecurringExpenses();
    } catch (error) {
      console.error("Error processing recurring expenses:", error);
    }
  };

  const getNextDueDate = (expense) => {
    const nextDate = new Date(expense.next_due_date);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="premium-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
            Recurring Expenses
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Subscriptions, bills, and scheduled payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={processRecurringExpenses}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition duration-200"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            ⚡ Process Due
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition duration-200"
            style={{
              background: showForm
                ? "var(--bg-card)"
                : "linear-gradient(to right, #c9a227, #e2b84d)",
              color: showForm ? "var(--text-primary)" : "#000",
              border: "1px solid var(--border)",
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Recurring"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-xl space-y-4"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Netflix Subscription"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
              rows="2"
              placeholder="Add optional reminder or subscription notes..."
            ></textarea>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-semibold transition duration-200"
              style={{ background: "linear-gradient(to right, #c9a227, #e2b84d)", color: "#000" }}
            >
              {editingId ? "Update Recurring" : "Save Recurring"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  title: "",
                  amount: "",
                  category: "",
                  frequency: "monthly",
                  start_date: new Date().toISOString().split("T")[0],
                  end_date: "",
                  notes: "",
                });
                setEditingId(null);
              }}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition duration-200"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {recurringExpenses.length === 0 ? (
          <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">🔄</p>
            <p className="font-medium">No recurring expenses set</p>
            <p className="text-xs mt-1">Add your subscriptions or regular bills to automate tracking.</p>
          </div>
        ) : (
          recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 rounded-xl transition duration-200"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-base sm:text-lg" style={{ color: "var(--text-heading)" }}>
                      {expense.title}
                    </span>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {expense.frequency}
                    </span>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    ₹{Number(expense.amount).toFixed(2)}
                    <span className="font-normal text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>
                      • {expense.category}
                    </span>
                  </div>
                  {expense.notes && (
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      {expense.notes}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-1.5 rounded-lg text-sm transition hover:scale-110"
                    style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 rounded-lg text-sm transition hover:scale-110"
                    style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center text-xs mt-3 pt-2.5 gap-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <span>Started: {expense.start_date}</span>
                <span
                  className={`font-semibold ${
                    getNextDueDate(expense) === "Overdue"
                      ? "text-red-500"
                      : getNextDueDate(expense) === "Due today"
                      ? "text-amber-500"
                      : "text-emerald-400"
                  }`}
                >
                  {getNextDueDate(expense)}
                </span>
                {expense.end_date && (
                  <span>Ends: {expense.end_date}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringExpenseManager;
