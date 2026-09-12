import { useState, useContext } from "react";
import API from "../../services/api";
import { NotificationContext } from "../../context/NotificationContext";

const INCOME_CATEGORIES = [
  { id: "salary", name: "Salary", icon: "💼", color: "#10B981" },
  { id: "freelance", name: "Freelance", icon: "💻", color: "#3B82F6" },
  { id: "investments", name: "Investments", icon: "📈", color: "#8B5CF6" },
  { id: "business", name: "Business", icon: "🏢", color: "#F59E0B" },
  { id: "rental", name: "Rental", icon: "🏠", color: "#06B6D4" },
  { id: "gift", name: "Gift / Bonus", icon: "🎁", color: "#EC4899" },
  { id: "other", name: "Other", icon: "💵", color: "#6B7280" },
];

const PRESET_SOURCES = ["Monthly Salary", "Freelance Gig", "Stock Dividend", "Rental Income", "Consulting", "Annual Bonus"];

function IncomeManager({ incomes = [], refresh }) {
  const { addToast } = useContext(NotificationContext);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const resetForm = () => {
    setFormData({
      source: "",
      amount: "",
      category: "Salary",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (income) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      category: income.category || "Salary",
      date: income.date ? income.date.split("T")[0] : new Date().toISOString().split("T")[0],
      notes: income.notes || "",
    });
    setEditingId(income.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?")) return;
    try {
      await API.delete(`/incomes/${id}`);
      if (addToast) addToast("Income Deleted", "The income entry has been removed.", "info");
      if (refresh) refresh();
    } catch (err) {
      console.error("Error deleting income:", err);
      if (addToast) addToast("Delete Failed", "Could not delete income entry.", "warning");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (!amountNum || amountNum <= 0) {
      if (addToast) addToast("Invalid Amount", "Please enter a positive income amount.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await API.put(`/incomes/${editingId}`, formData);
        if (addToast) addToast("Income Updated", `Updated ${formData.source} successfully.`, "success");
      } else {
        await API.post("/incomes", formData);
        if (addToast) addToast("Income Added", `Added ₹${amountNum.toFixed(2)} from ${formData.source}.`, "success");
      }
      resetForm();
      if (refresh) refresh();
    } catch (err) {
      console.error("Error saving income:", err);
      if (addToast) addToast("Save Failed", "Could not save income. Please try again.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncomes = incomes.filter((item) => {
    const matchesSearch = item.source.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryMeta = (catName) => {
    return INCOME_CATEGORIES.find((c) => c.name.toLowerCase() === (catName || "").toLowerCase()) || {
      name: catName || "Other",
      icon: "💵",
      color: "#6B7280",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="premium-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💵</span>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
              Income Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Log and categorize your revenue streams to unlock Net Savings and Savings Rate analytics.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider font-semibold block" style={{ color: "var(--text-muted)" }}>
              Total Recorded Income
            </span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm transition duration-200 flex items-center gap-2 shadow-lg shrink-0"
            style={{
              background: showForm ? "var(--bg-input)" : "linear-gradient(to right, #10B981, #059669)",
              color: "#ffffff",
              border: "1px solid var(--border)",
            }}
          >
            {showForm ? "✕ Close Form" : "＋ Log Income"}
          </button>
        </div>
      </div>

      {/* Income Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="premium-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-300"
          style={{ border: "1px solid var(--accent)" }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>
              {editingId ? "✏️ Edit Income Entry" : "＋ Log New Income"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SOURCES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFormData((prev) => ({ ...prev, source: preset }))}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition"
                  style={{
                    backgroundColor: formData.source === preset ? "var(--accent)" : "var(--bg-input)",
                    color: formData.source === preset ? "#000" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Income Source *
              </label>
              <input
                type="text"
                placeholder="e.g. Salary, Client payment"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Date Received
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Additional details or reference..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full premium-input px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white transition duration-200 disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #10B981, #059669)" }}
            >
              {isSubmitting ? "Saving..." : editingId ? "Update Income" : "Save Income"}
            </button>
          </div>
        </form>
      )}

      {/* Incomes List / Table */}
      <div className="premium-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold" style={{ color: "var(--text-heading)" }}>
              Recorded Incomes
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing {filteredIncomes.length} of {incomes.length} entries
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Search source or notes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="premium-input px-3 py-1.5 text-xs sm:text-sm focus:outline-none w-44 sm:w-56"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="premium-input px-3 py-1.5 text-xs sm:text-sm focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {INCOME_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredIncomes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl block">💸</span>
            <p className="font-medium text-sm" style={{ color: "var(--text-muted)" }}>
              No income entries recorded yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition"
            >
              ＋ Add your first income
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                  <th className="p-3.5 text-left font-semibold" style={{ color: "var(--text-heading)" }}>
                    Source
                  </th>
                  <th className="p-3.5 text-left font-semibold" style={{ color: "var(--text-heading)" }}>
                    Category
                  </th>
                  <th className="p-3.5 text-left font-semibold" style={{ color: "var(--text-heading)" }}>
                    Date
                  </th>
                  <th className="p-3.5 text-right font-semibold" style={{ color: "var(--text-heading)" }}>
                    Amount
                  </th>
                  <th className="p-3.5 text-center font-semibold" style={{ color: "var(--text-heading)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredIncomes.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  return (
                    <tr
                      key={item.id}
                      className="transition duration-150 hover:bg-white/[0.02]"
                    >
                      <td className="p-3.5 font-medium">
                        <div style={{ color: "var(--text-heading)" }}>{item.source}</div>
                        {item.notes && (
                          <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "var(--text-muted)" }}>
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            color: meta.color,
                            border: `1px solid ${meta.color}35`,
                          }}
                        >
                          <span>{meta.icon}</span>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        +₹{Number(item.amount).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-xs hover:scale-110 transition"
                            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-xs hover:scale-110 transition"
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeManager;
