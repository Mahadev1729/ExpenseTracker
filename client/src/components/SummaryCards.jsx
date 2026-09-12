import { ShimmerSummaryCards } from "./Shimmer";

function SummaryCards({ expenses, isLoading = false }) {
  if (isLoading) {
    return <ShimmerSummaryCards />;
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <div className="premium-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Total Expenses
        </h3>
        <p className="text-xl sm:text-2xl font-black mt-1" style={{ color: "var(--accent)" }}>
          ₹{total.toFixed(2)}
        </p>
      </div>

      <div className="premium-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Total Transactions
        </h3>
        <p className="text-xl sm:text-2xl font-black mt-1" style={{ color: "var(--text-heading)" }}>
          {expenses.length}
        </p>
      </div>

      <div className="premium-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Average Expense
        </h3>
        <p className="text-xl sm:text-2xl font-black mt-1" style={{ color: "var(--text-heading)" }}>
          ₹{expenses.length ? (total / expenses.length).toFixed(2) : "0.00"}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;
