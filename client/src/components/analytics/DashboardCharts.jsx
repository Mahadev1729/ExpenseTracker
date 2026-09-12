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
import API from "../../services/api";
import { ShimmerChart } from "../shared/Shimmer";

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

function DashboardCharts({ expenses, isLoading = false }) {
  const [expenseStats, setExpenseStats] = useState([]);
  const [dateRangeData, setDateRangeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod]);

  const loadChartData = async () => {
    try {
      setStatsLoading(true);
      await Promise.all([fetchExpenseStats(), fetchDateRangeData()]);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchExpenseStats = async () => {
    try {
      const response = await API.get(
        `/expenses/stats?period=${selectedPeriod}`,
      );
      setExpenseStats(response.data);
    } catch (error) {
      console.error("Error fetching expense stats:", error);
    }
  };

  const fetchDateRangeData = async () => {
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const startDateStr = startDate.toISOString().split("T")[0];

      const response = await API.get(
        `/expenses/date-range?startDate=${startDateStr}&endDate=${endDate}`,
      );
      setDateRangeData(response.data);
    } catch (error) {
      console.error("Error fetching date range data:", error);
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShimmerChart />
        <ShimmerChart />
      </div>
    );
  }

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
    labels: topExpenses.map((e) =>
      e.title.length > 20 ? e.title.substring(0, 20) + "..." : e.title,
    ),
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
    labels: dateRangeData.map((d) => d.date),
    datasets: [
      {
        label: "Daily Total ($)",
        data: dateRangeData.map((d) => d.total_amount),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expense Count",
        data: dateRangeData.map((d) => d.expense_count),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const categoryStatsData = {
    labels: expenseStats.map((stat) => stat.category),
    datasets: [
      {
        label: "Total Amount ($)",
        data: expenseStats.map((stat) => stat.total_amount),
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label || ""}: ₹${context.parsed.y ?? context.parsed}`;
          },
        },
      },
    },
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Amount (₹)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Count",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
            Analytics Dashboard
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Visual breakdowns and spending trends
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="premium-input px-3.5 py-2 text-xs sm:text-sm font-semibold focus:outline-none"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
            Expense Distribution by Category
          </h3>
          <div className="relative h-64 sm:h-72 w-full">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        <div className="premium-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
            Top 10 Expenses
          </h3>
          <div className="relative h-64 sm:h-72 w-full">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="premium-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
          Expense Trends (Last 6 Months)
        </h3>
        <div className="relative h-64 sm:h-80 w-full">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      <div className="premium-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
          Category Statistics ({selectedPeriod})
        </h3>
        <div className="relative h-64 sm:h-72 w-full">
          <Bar data={categoryStatsData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {expenseStats.slice(0, 3).map((stat, index) => (
          <div key={index} className="premium-card p-4 sm:p-5">
            <h4 className="text-base font-bold mb-3" style={{ color: "var(--text-heading)" }}>
              {stat.category}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-muted)" }}>Total:</span>
                <span className="font-bold" style={{ color: "var(--accent)" }}>
                  ₹{Number(stat.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-muted)" }}>Average:</span>
                <span className="font-semibold" style={{ color: "var(--text-heading)" }}>
                  ₹{Number(stat.avg_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-muted)" }}>Count:</span>
                <span className="font-semibold" style={{ color: "var(--text-heading)" }}>
                  {stat.total_expenses}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardCharts;
