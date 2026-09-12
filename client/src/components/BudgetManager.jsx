import { useState, useEffect } from "react";
import API from "../services/api";
import { ShimmerBudgetManager } from "./Shimmer";

function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchBudgets(), fetchCategories(), fetchBudgetProgress()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await API.get("/budgets");
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
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

  const fetchBudgetProgress = async () => {
    try {
      const response = await API.get("/budgets/progress");
      setBudgetProgress(response.data);
    } catch (error) {
      console.error("Error fetching budget progress:", error);
    }
  };

  if (isLoading) {
    return <ShimmerBudgetManager />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.category_id) payload.category_id = null;
    try {
      if (editingId) {
        await API.put(`/budgets/${editingId}`, payload);
      } else {
        await API.post("/budgets", payload);
      }
      fetchBudgets();
      fetchBudgetProgress();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      amount: "",
      period: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setEditingId(null);
  };

  const handleEdit = (budget) => {
    setFormData({
      category_id: budget.category_id || "",
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date || "",
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await API.delete(`/budgets/${id}`);
        fetchBudgets();
        fetchBudgetProgress();
      } catch (error) {
        console.error("Error deleting budget:", error);
      }
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#ef4444";
    if (progress >= 80) return "#eab308";
    return "#22c55e";
  };

  const getProgressBg = (progress) => {
    if (progress >= 100) return "rgba(239,68,68,0.15)";
    if (progress >= 80) return "rgba(234,179,8,0.15)";
    return "rgba(34,197,94,0.15)";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? `${category.icon || ""} ${category.name}` : "All Categories";
  };

  const inputCls = "w-full premium-input px-3 py-2 text-sm focus:outline-none";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="premium-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>
              Financial Planning
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: "var(--text-heading)" }}>
              Budget Manager
            </h2>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: showForm
                ? "var(--bg-card)"
                : "linear-gradient(to right, #c9a227, #e2b84d)",
              color: showForm ? "var(--text-primary)" : "#000",
              border: "1px solid var(--border)",
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Budget"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className={labelCls} style={{ color: "var(--text-muted)" }}>Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--text-muted)" }}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={inputCls}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--text-muted)" }}>Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className={inputCls}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--text-muted)" }}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: "var(--text-muted)" }}>End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: "linear-gradient(to right, #c9a227, #e2b84d)", color: "#000" }}
              >
                {editingId ? "Update Budget" : "Save Budget"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <div className="premium-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: "var(--text-heading)" }}>
            📊 Live Budget Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgetProgress.map((budget) => {
              const pct = Math.min(budget.progress_percentage || 0, 100);
              const barColor = getProgressColor(budget.progress_percentage || 0);
              const badgeBg = getProgressBg(budget.progress_percentage || 0);
              return (
                <div
                  key={budget.id}
                  className="rounded-xl p-4 space-y-2"
                  style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-heading)" }}>
                      {budget.category_name || "All Categories"}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: badgeBg, color: barColor }}
                    >
                      {Math.round(budget.progress_percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>₹{Number(budget.spent_amount || 0).toFixed(2)} spent</span>
                    <span>₹{Number(budget.amount).toFixed(2)} limit</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="premium-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: "var(--text-heading)" }}>
          🗂️ Your Budgets
        </h3>
        {budgets.length === 0 ? (
          <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No budgets yet</p>
            <p className="text-sm mt-1">Click &quot;+ Add Budget&quot; to create your first budget.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-heading)" }}>
                      {getCategoryName(budget.category_id)}
                    </p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {budget.period}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                  ₹{Number(budget.amount).toFixed(2)}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {budget.start_date}{budget.end_date ? ` → ${budget.end_date}` : " (ongoing)"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetManager;
