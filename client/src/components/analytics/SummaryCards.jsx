import { ShimmerSummaryCards } from "../shared/Shimmer";

function SummaryCards({ expenses = [], incomes = [], isLoading = false }) {
  if (isLoading) {
    return <ShimmerSummaryCards />;
  }

  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalIncome = (incomes || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const isSurplus = netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Income */}
      <div className="premium-card p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Income
          </h3>
          <span className="text-sm p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            💵
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-black mt-2 text-emerald-400">
          ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {incomes.length} {incomes.length === 1 ? "entry" : "entries"} recorded
        </p>
      </div>

      {/* 2. Total Expenses */}
      <div className="premium-card p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Expenses
          </h3>
          <span className="text-sm p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            💳
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-black mt-2" style={{ color: "var(--accent)" }}>
          ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {expenses.length} {expenses.length === 1 ? "transaction" : "transactions"}
        </p>
      </div>

      {/* 3. Net Savings */}
      <div className="premium-card p-4 sm:p-5 relative overflow-hidden group transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Net Savings
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isSurplus
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
            }`}
          >
            {isSurplus ? "Surplus" : "Deficit"}
          </span>
        </div>
        <p
          className={`text-xl sm:text-2xl font-black mt-2 ${
            isSurplus ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isSurplus ? "+" : "-"}₹{Math.abs(netSavings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Cash Flow (Income - Expenses)
        </p>
      </div>

      {/* 4. Savings Rate */}
      <div className="premium-card p-4 sm:p-5 relative overflow-hidden group transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Savings Rate
          </h3>
          <span className="text-sm p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            🎯
          </span>
        </div>
        <p
          className={`text-xl sm:text-2xl font-black mt-2 ${
            savingsRate >= 20
              ? "text-emerald-400"
              : savingsRate >= 0
              ? "text-amber-400"
              : "text-rose-400"
          }`}
        >
          {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : "N/A"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {totalIncome > 0
            ? savingsRate >= 20
              ? "Healthy (≥20% target)"
              : savingsRate >= 0
              ? "Positive savings"
              : "Deficit spending"
            : "Log income to calculate"}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;
