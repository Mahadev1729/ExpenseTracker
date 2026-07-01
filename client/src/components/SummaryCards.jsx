function SummaryCards({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="premium-card p-4">
        <h3 className="text-gray-400">Total Expenses</h3>
        <p className="text-xl font-bold text-white">₹{total}</p>
      </div>

      <div className="premium-card p-4">
        <h3 className="text-gray-400">Total Transactions</h3>
        <p className="text-xl font-bold text-white">{expenses.length}</p>
      </div>

      <div className="premium-card p-4">
        <h3 className="text-gray-400">Average</h3>
        <p className="text-xl font-bold text-white">
          ₹{expenses.length ? (total / expenses.length).toFixed(2) : 0}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;
