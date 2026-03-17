import { useState, useEffect } from "react";
import API from "../services/api";

function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchBudgetProgress();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/budgets/${editingId}`, formData);
      } else {
        await API.post("/budgets", formData);
      }
      fetchBudgets();
      fetchBudgetProgress();
      setShowForm(false);
      setFormData({
        category_id: "",
        amount: "",
        period: "monthly",
        start_date: new Date().toISOString().split('T')[0],
        end_date: ""
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category_id: budget.category_id || "",
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date || ""
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
    if (progress >= 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "All Categories";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Budget Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          {showForm ? "Cancel" : "Add Budget"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
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
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              {editingId ? "Update" : "Add"} Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  category_id: "",
                  amount: "",
                  period: "monthly",
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: ""
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

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetProgress.map((budget) => (
              <div key={budget.id} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">
                    {budget.category_name || "All Categories"}
                  </span>
                  <span className="text-sm text-gray-600">
                    ${budget.spent_amount || 0} / ${budget.amount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budget.progress_percentage || 0)}`}
                    style={{ width: `${Math.min(budget.progress_percentage || 0, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(budget.progress_percentage || 0)}% used
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-800">
                      {getCategoryName(budget.category_id)}
                    </span>
                    <div className="text-sm text-gray-600 capitalize">{budget.period}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800">${budget.amount}</div>
                <div className="text-sm text-gray-600">
                  {budget.start_date} {budget.end_date && `to ${budget.end_date}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetManager;
