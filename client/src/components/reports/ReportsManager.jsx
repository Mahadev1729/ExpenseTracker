import { useState, useMemo } from "react";
import { generateFinancialReportPDF, exportToCSV, exportToJSON } from "../../utils/reportGenerator";
import { formatCategoryLabel } from "../../utils/categoryIcons";

function ReportsManager({
  expenses = [],
  incomes = [],
  budgets = [],
  categories = [],
  user = null,
}) {
  // Preset time ranges
  const [selectedPreset, setSelectedPreset] = useState("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "expenses" | "incomes"
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute date bounds for presets
  const { dateRange, periodLabel } = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let label = "This Month";

    switch (selectedPreset) {
      case "this_month": {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = now.toLocaleString("default", { month: "long", year: "numeric" });
        break;
      }
      case "last_month": {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        label = prevMonthDate.toLocaleString("default", { month: "long", year: "numeric" });
        break;
      }
      case "last_30_days": {
        start = new Date();
        start.setDate(now.getDate() - 30);
        label = "Last 30 Days";
        break;
      }
      case "this_quarter": {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterMonth, 1);
        label = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
        break;
      }
      case "ytd": {
        start = new Date(now.getFullYear(), 0, 1);
        label = `Year to Date (${now.getFullYear()})`;
        break;
      }
      case "all_time": {
        start = null;
        end = null;
        label = "All Time";
        break;
      }
      case "custom": {
        start = customStartDate ? new Date(customStartDate) : null;
        end = customEndDate ? new Date(`${customEndDate}T23:59:59`) : null;
        label =
          customStartDate && customEndDate
            ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
            : "Custom Range";
        break;
      }
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = "This Month";
    }

    return { dateRange: { start, end }, periodLabel: label };
  }, [selectedPreset, customStartDate, customEndDate]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const eDate = new Date(e.date);
      if (dateRange.start && eDate < dateRange.start) return false;
      if (dateRange.end && eDate > dateRange.end) return false;
      if (filterCategory !== "all" && e.category !== filterCategory) return false;
      return true;
    });
  }, [expenses, dateRange, filterCategory]);

  // Filtered incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      const iDate = new Date(i.date);
      if (dateRange.start && iDate < dateRange.start) return false;
      if (dateRange.end && iDate > dateRange.end) return false;
      if (filterCategory !== "all" && i.category !== filterCategory) return false;
      return true;
    });
  }, [incomes, dateRange, filterCategory]);

  // Combined transactions for preview & export
  const combinedTransactions = useMemo(() => {
    const list = [];
    if (filterType === "all" || filterType === "expenses") {
      filteredExpenses.forEach((e) => {
        list.push({
          id: `exp-${e.id}`,
          date: e.date,
          type: "Expense",
          title: e.title || "Expense",
          category: e.category || "General",
          amount: parseFloat(e.amount || 0),
          notes: e.notes || "",
        });
      });
    }

    if (filterType === "all" || filterType === "incomes") {
      filteredIncomes.forEach((i) => {
        list.push({
          id: `inc-${i.id}`,
          date: i.date,
          type: "Income",
          title: i.source || i.title || "Income",
          category: i.category || "Income",
          amount: parseFloat(i.amount || 0),
          notes: i.notes || "",
        });
      });
    }

    // Sort by date descending
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query))
    );
  }, [filteredExpenses, filteredIncomes, filterType, searchQuery]);

  // Calculations
  const totalIncome = filteredIncomes.reduce((acc, i) => acc + parseFloat(i.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Handlers
  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPdf(true);
      generateFinancialReportPDF({
        expenses: filteredExpenses,
        incomes: filteredIncomes,
        budgets,
        categories,
        user,
        periodLabel,
        currency: "$",
      });
    } catch (err) {
      console.error("Error generating PDF report:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const filename = `Statement_${periodLabel.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    exportToCSV({
      expenses: filteredExpenses,
      incomes: filteredIncomes,
      mode: filterType,
      filename,
    });
  };

  const handleExportJSON = () => {
    const filename = `Financial_Export_${periodLabel.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    exportToJSON({
      data: {
        user: { name: user?.name, email: user?.email },
        period: periodLabel,
        generatedAt: new Date().toISOString(),
        summary: {
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate: `${savingsRate}%`,
        },
        expenses: filteredExpenses,
        incomes: filteredIncomes,
      },
      filename,
    });
  };

  const presets = [
    { id: "this_month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "last_30_days", label: "Last 30 Days" },
    { id: "this_quarter", label: "This Quarter" },
    { id: "ytd", label: "Year to Date" },
    { id: "all_time", label: "All Time" },
    { id: "custom", label: "Custom Range" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Banner */}
      <div className="premium-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📄</span>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
              Financial Reports & Statements
            </h2>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Generate executive monthly digests, export spreadsheets for tax filing, and analyze cash flow.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black shadow-md transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            <span>{isGeneratingPdf ? "⏳" : "📥"}</span>
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF Statement"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition duration-200 cursor-pointer"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            title="Download CSV formatted for Microsoft Excel and Google Sheets"
          >
            <span>📊</span>
            <span>Export to CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl font-medium text-xs transition duration-200 cursor-pointer"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
            title="Download full JSON dataset"
          >
            <span>💾 JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Panel */}
      <div className="premium-card p-5 sm:p-6 space-y-4">
        {/* Preset Range Buttons */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--text-muted)" }}>
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const active = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-[#c9a227] text-black font-semibold shadow"
                      : "hover:bg-white/10"
                  }`}
                  style={
                    !active
                      ? {
                          backgroundColor: "var(--bg-input)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }
                      : {}
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Range Inputs (Shown when Custom Range is active) */}
        {selectedPreset === "custom" && (
          <div className="p-3.5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full premium-input px-3 py-2 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full premium-input px-3 py-2 text-xs sm:text-sm focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Secondary Filters: Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Transaction Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full premium-input px-3 py-2 text-xs sm:text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Cashflow (Incomes & Expenses)</option>
              <option value="expenses">Expenses Only</option>
              <option value="incomes">Incomes Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Filter Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full premium-input px-3 py-2 text-xs sm:text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {formatCategoryLabel(c.icon, c.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Search Description
            </label>
            <input
              type="text"
              placeholder="Search title, source or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full premium-input px-3 py-2 text-xs sm:text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Statement Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inflows */}
        <div className="premium-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Inflows
          </p>
          <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-500 mt-1">
            +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {filteredIncomes.length} credit entries
          </p>
        </div>

        {/* Total Outflows */}
        <div className="premium-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Outflows
          </p>
          <h3 className="text-lg sm:text-2xl font-extrabold text-red-500 mt-1">
            -${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {filteredExpenses.length} debit entries
          </p>
        </div>

        {/* Net Savings */}
        <div className="premium-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Net Surplus / Savings
          </p>
          <h3 className={`text-lg sm:text-2xl font-extrabold mt-1 ${netSavings >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {netSavings >= 0 ? "+" : "-"}${Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {netSavings >= 0 ? "Positive Cash Flow" : "Deficit (Expenses exceed income)"}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="premium-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Savings Rate %
          </p>
          <h3 className="text-lg sm:text-2xl font-extrabold text-[#c9a227] mt-1">
            {savingsRate}%
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Target benchmark: &gt;20%
          </p>
        </div>
      </div>

      {/* Statement Preview Table */}
      <div className="premium-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-heading)" }}>
              Statement Preview: {periodLabel}
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing {combinedTransactions.length} itemized transaction{combinedTransactions.length === 1 ? "" : "s"}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            Auto-synced with export
          </span>
        </div>

        {combinedTransactions.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            <p className="text-3xl mb-2">📭</p>
            No transactions found for this time period or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Title / Source</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {combinedTransactions.slice(0, 50).map((tx) => {
                  const isIncome = tx.type === "Income";
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition duration-150">
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            isIncome
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {isIncome ? "Inflow" : "Outflow"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium" style={{ color: "var(--text-heading)" }}>
                        {tx.title}
                      </td>
                      <td className="py-2.5 px-3" style={{ color: "var(--text-secondary)" }}>
                        {tx.category}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold text-right whitespace-nowrap ${
                          isIncome ? "text-emerald-500" : "text-red-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-xs max-w-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {tx.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {combinedTransactions.length > 50 && (
              <p className="text-center text-xs py-3" style={{ color: "var(--text-muted)" }}>
                Showing first 50 transactions in preview. Full dataset ({combinedTransactions.length} records) will be included in the exported PDF and CSV.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsManager;
