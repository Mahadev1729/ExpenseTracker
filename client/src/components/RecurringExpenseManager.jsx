import { useState, useEffect } from "react";
import API from "../services/api";

function RecurringExpenseManager() {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    frequency: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    notes: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRecurringExpenses();
    fetchCategories();
  }, []);

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
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        notes: ""
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
      notes: expense.notes || ""
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recurring expense?")) {
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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recurring Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={processRecurringExpenses}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
          >
            Process Due Expenses
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {showForm ? "Cancel" : "Add Recurring Expense"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              {editingId ? "Update" : "Add"} Recurring Expense
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
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: "",
                  notes: ""
                });
                setEditingId(null);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {recurringExpenses.map((expense) => (
          <div key={expense.id} className="border border-gray-200 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-lg">{expense.title}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                    {expense.frequency}
                  </span>
                </div>
                <div className="text-gray-600">
                  ${expense.amount} • {expense.category}
                </div>
                {expense.notes && (
                  <div className="text-sm text-gray-500 mt-1">{expense.notes}</div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(expense)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Started: {expense.start_date}</span>
              <span className={`font-medium ${
                getNextDueDate(expense) === "Overdue" ? "text-red-600" :
                getNextDueDate(expense) === "Due today" ? "text-orange-600" : "text-green-600"
              }`}>
                {getNextDueDate(expense)}
              </span>
            </div>
            {expense.end_date && (
              <div className="text-sm text-gray-600 mt-1">
                Ends: {expense.end_date}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecurringExpenseManager;
