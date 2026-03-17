function SummaryCards({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 shadow rounded">
        <h3>Total Expenses</h3>
        <p className="text-xl font-bold">₹{total}</p>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3>Total Transactions</h3>
        <p className="text-xl font-bold">{expenses.length}</p>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3>Average</h3>
        <p className="text-xl font-bold">
          ₹{expenses.length ? (total / expenses.length).toFixed(2) : 0}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;
