import { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import API from "../services/api";

ChartJS.register(
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function DashboardCharts({ expenses }) {
  const [expenseStats, setExpenseStats] = useState([]);
  const [dateRangeData, setDateRangeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchExpenseStats();
    fetchDateRangeData();
  }, [selectedPeriod]);

  const fetchExpenseStats = async () => {
    try {
      const response = await API.get(`/expenses/stats?period=${selectedPeriod}`);
      setExpenseStats(response.data);
    } catch (error) {
      console.error("Error fetching expense stats:", error);
    }
  };

  const fetchDateRangeData = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const startDateStr = startDate.toISOString().split('T')[0];

      const response = await API.get(`/expenses/date-range?startDate=${startDateStr}&endDate=${endDate}`);
      setDateRangeData(response.data);
    } catch (error) {
      console.error("Error fetching date range data:", error);
    }
  };

  const categories = {};
  expenses.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const pieData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#6366f1",
          "#14b8a6",
          "#f97316",
          "#84cc16",
        ],
      },
    ],
  };

  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10);

  const barData = {
    labels: topExpenses.map((e) => e.title.length > 20 ? e.title.substring(0, 20) + "..." : e.title),
    datasets: [
      {
        label: "Amount ($)",
        data: topExpenses.map((e) => e.amount),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: dateRangeData.map(d => d.date),
    datasets: [
      {
        label: "Daily Total ($)",
        data: dateRangeData.map(d => d.total_amount),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expense Count",
        data: dateRangeData.map(d => d.expense_count),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const categoryStatsData = {
    labels: expenseStats.map(stat => stat.category),
    datasets: [
      {
        label: "Total Amount ($)",
        data: expenseStats.map(stat => stat.total_amount),
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y}`;
          }
        }
      }
    },
  };

  const trendOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Amount ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Count'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Distribution by Category</h3>
          <Pie data={pieData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Expenses</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Trends (Last 6 Months)</h3>
        <Line data={trendData} options={trendOptions} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Statistics ({selectedPeriod})</h3>
        <Bar data={categoryStatsData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {expenseStats.slice(0, 3).map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{stat.category}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-green-600">${stat.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-bold">${stat.avg_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Count:</span>
                <span className="font-bold">{stat.total_expenses}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardCharts;
