import { useState, useEffect } from "react";
import API from "../../services/api";
import { generateExpensePDF } from "../../utils/pdfGenerator";
import { exportToCSV, exportToJSON } from "../../utils/reportGenerator";
import { ShimmerTable } from "../shared/Shimmer";
import { formatCategoryLabel } from "../../utils/categoryIcons";

function ExpenseTable({
  expenses: initialExpenses,
  refresh,
  isLoading = false,
}) {
  if (isLoading) {
    return <ShimmerTable rows={8} columns={5} />;
  }
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState(initialExpenses);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setExpenses(initialExpenses);
    setFilteredExpenses(initialExpenses);
  }, [initialExpenses]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filters.search) {
      filtered = filtered.filter(
        (expense) =>
          expense.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (expense.notes &&
            expense.notes.toLowerCase().includes(filters.search.toLowerCase())),
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (expense) => expense.category === filters.category,
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (expense) => expense.date >= filters.startDate,
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter((expense) => expense.date <= filters.endDate);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(
        (expense) =>
          parseFloat(expense.amount) >= parseFloat(filters.minAmount),
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(
        (expense) =>
          parseFloat(expense.amount) <= parseFloat(filters.maxAmount),
      );
    }

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredExpenses(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const exportData = (format) => {
    try {
      if (format === "pdf") {
        generateExpensePDF(filteredExpenses, categories);
        return;
      }

      if (format === "csv") {
        exportToCSV({
          expenses: filteredExpenses,
          mode: "expenses",
          filename: `expenses_${new Date().toISOString().split("T")[0]}.csv`,
        });
        return;
      }

      if (format === "json") {
        exportToJSON({
          data: filteredExpenses,
          filename: `expenses_${new Date().toISOString().split("T")[0]}.json`,
        });
        return;
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const remove = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await API.delete(`/expenses/${id}`);
        refresh();
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="premium-card p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
            Expenses
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Showing {filteredExpenses.length} of {expenses.length} transaction{expenses.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200"
            style={{
              backgroundColor: showFilters ? "var(--accent)" : "var(--bg-input)",
              color: showFilters ? "#000" : "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {showFilters ? "✕ Hide Filters" : "🔍 Filters"}
          </button>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  exportData(e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 cursor-pointer"
              style={{
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              defaultValue=""
            >
              <option value="" disabled>
                📥 Export
              </option>
              <option value="pdf">📄 PDF</option>
              <option value="csv">📊 CSV</option>
              <option value="json">💾 JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Box */}
      {showFilters && (
        <div
          className="mb-6 p-4 rounded-xl space-y-4"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search title or notes..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {formatCategoryLabel(category.icon, category.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Min Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({ ...filters, minAmount: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Max Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({ ...filters, maxAmount: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full premium-input px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View (<640px) */}
      <div className="block sm:hidden space-y-3">
        {filteredExpenses.map((e) => (
          <div
            key={e.id}
            className="p-3.5 rounded-xl transition duration-200"
            style={{
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text-heading)" }}>
                  {e.title}
                </p>
                {e.notes && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {e.notes}
                  </p>
                )}
              </div>
              <p className="text-base font-bold shrink-0" style={{ color: "var(--accent)" }}>
                ₹{Number(e.amount).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  {e.category}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {e.date}
                </span>
              </div>
              <button
                onClick={() => remove(e.id)}
                className="text-xs font-semibold px-2 py-1 rounded text-red-500 hover:bg-red-500/10 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table View (>=640px) */}
      <div className="hidden sm:block overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <th
                className="p-3.5 text-left cursor-pointer transition select-none"
                onClick={() => handleSort("title")}
                style={{ color: "var(--text-heading)" }}
              >
                Title {getSortIcon("title")}
              </th>
              <th
                className="p-3.5 text-left cursor-pointer transition select-none"
                onClick={() => handleSort("amount")}
                style={{ color: "var(--text-heading)" }}
              >
                Amount {getSortIcon("amount")}
              </th>
              <th
                className="p-3.5 text-left cursor-pointer transition select-none"
                onClick={() => handleSort("category")}
                style={{ color: "var(--text-heading)" }}
              >
                Category {getSortIcon("category")}
              </th>
              <th
                className="p-3.5 text-left cursor-pointer transition select-none"
                onClick={() => handleSort("date")}
                style={{ color: "var(--text-heading)" }}
              >
                Date {getSortIcon("date")}
              </th>
              <th className="p-3.5 text-right" style={{ color: "var(--text-heading)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr
                key={e.id}
                className="transition duration-150"
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "var(--bg-card-hover)"}
                onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}
              >
                <td className="p-3.5">
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text-heading)" }}>
                      {e.title}
                    </div>
                    {e.notes && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {e.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-bold" style={{ color: "var(--accent)" }}>
                  ₹{Number(e.amount).toFixed(2)}
                </td>
                <td className="p-3.5">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    {e.category}
                  </span>
                </td>
                <td className="p-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  {e.date}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => remove(e.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-medium">No expenses found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseTable;
