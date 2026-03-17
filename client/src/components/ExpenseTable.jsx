import { useState, useEffect } from "react";
import API from "../services/api";
import { generateExpensePDF } from "../utils/pdfGenerator";

function ExpenseTable({ expenses: initialExpenses, refresh }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState(initialExpenses);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc"
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
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (expense.notes && expense.notes.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    if (filters.startDate) {
      filtered = filtered.filter(expense => expense.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(expense => expense.date <= filters.endDate);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(expense => parseFloat(expense.amount) >= parseFloat(filters.minAmount));
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(expense => parseFloat(expense.amount) <= parseFloat(filters.maxAmount));
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

  const exportData = async (format) => {
    try {
      if (format === 'pdf') {
        generateExpensePDF(filteredExpenses, categories);
        return;
      }

      const response = await API.get(`/expenses/export?format=${format}&${new URLSearchParams(filters).toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        downloadBlob(dataBlob, 'expenses.json');
      } else {
        downloadBlob(response.data, 'expenses.csv');
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
      maxAmount: ""
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
          <div className="relative">
            <select
              onChange={(e) => exportData(e.target.value)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="pdf">📄 Export PDF</option>
              <option value="csv">📊 Export CSV</option>
              <option value="json">💾 Export JSON</option>
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search title or notes..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th
                className="p-3 text-left cursor-pointer hover:bg-gray-300"
                onClick={() => handleSort("title")}
              >
                Title {getSortIcon("title")}
              </th>
              <th
                className="p-3 text-left cursor-pointer hover:bg-gray-300"
                onClick={() => handleSort("amount")}
              >
                Amount {getSortIcon("amount")}
              </th>
              <th
                className="p-3 text-left cursor-pointer hover:bg-gray-300"
                onClick={() => handleSort("category")}
              >
                Category {getSortIcon("category")}
              </th>
              <th
                className="p-3 text-left cursor-pointer hover:bg-gray-300"
                onClick={() => handleSort("date")}
              >
                Date {getSortIcon("date")}
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div>
                    <div className="font-medium text-gray-800">{e.title}</div>
                    {e.notes && <div className="text-sm text-gray-500">{e.notes}</div>}
                  </div>
                </td>
                <td className="p-3 font-medium text-green-600">${e.amount}</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {e.category}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{e.date}</td>
                <td className="p-3">
                  <button
                    onClick={() => remove(e.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
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
        <div className="text-center py-8 text-gray-500">
          No expenses found matching your criteria.
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </div>
    </div>
  );
}

export default ExpenseTable;
