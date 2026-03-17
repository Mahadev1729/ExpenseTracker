import { useState } from "react";
import API from "../services/api";

function ExpenseForm({ refresh }) {
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
    notes: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    await API.post("/expenses", expense);

    refresh();
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4">
      <input
        placeholder="Title"
        className="border p-2 mr-2"
        onChange={(e) => setExpense({ ...expense, title: e.target.value })}
      />

      <input
        placeholder="Amount"
        type="number"
        className="border p-2 mr-2"
        onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
      />

      <select
        className="border p-2 mr-2"
        onChange={(e) => setExpense({ ...expense, category: e.target.value })}
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Shopping</option>
        <option>Bills</option>
        <option>Others</option>
      </select>

      <input
        type="date"
        className="border p-2 mr-2"
        onChange={(e) => setExpense({ ...expense, date: e.target.value })}
      />

      <button className="bg-blue-500 text-white px-4 py-2">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
