import { useCallback, useEffect, useState, useContext } from "react";
import API from "../services/api";
import { NotificationContext } from "../context/NotificationContext";

import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import DashboardCharts from "../components/DashboardCharts";
import SummaryCards from "../components/SummaryCards";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";
import RecurringExpenseManager from "../components/RecurringExpenseManager";
import PacingAnalyzer from "../components/PacingAnalyzer";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [budgetProgress, setBudgetProgress] = useState([]);
  const { refresh: refreshNotifications } = useContext(NotificationContext);

  const loadBudgetProgress = useCallback(async () => {
    try {
      const res = await API.get("/budgets/progress");
      setBudgetProgress(res.data);
    } catch (error) {
      console.error("Error loading budget progress:", error);
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    const res = await API.get("/expenses");
    setExpenses(res.data);
    loadBudgetProgress();
    if (refreshNotifications) {
      refreshNotifications();
    }
  }, [refreshNotifications, loadBudgetProgress]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const tabs = [
    { id: "expenses", label: "Expenses", icon: "💰" },
    { id: "categories", label: "Categories", icon: "🏷️" },
    { id: "budgets", label: "Budgets", icon: "📊" },
    { id: "recurring", label: "Recurring", icon: "🔄" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "decision", label: "Decision Engine", icon: "⚖️" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "expenses":
        return (
          <div className="space-y-6">
            <SummaryCards expenses={expenses} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ExpenseForm refresh={loadExpenses} />
                <ExpenseTable expenses={expenses} refresh={loadExpenses} />
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Live Budget Progress
                  </h3>
                  {budgetProgress.length === 0 ? (
                    <div className="text-gray-500 text-sm py-4 text-center">
                      No active budgets set. Go to the "Budgets" tab to create one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgetProgress.map((budget) => {
                        const progress = budget.progress_percentage || 0;
                        let barColor = "bg-green-500";
                        if (progress >= 100) barColor = "bg-red-500";
                        else if (progress >= 80) barColor = "bg-yellow-500";

                        return (
                          <div key={budget.id} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                              <span>{budget.category_name || "All Categories"}</span>
                              <span>
                                ${Number(budget.spent_amount).toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{Math.round(progress)}% used</span>
                              {budget.end_date && (
                                <span>Ends {new Date(budget.end_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "categories":
        return <CategoryManager />;
      case "budgets":
        return <BudgetManager />;
      case "recurring":
        return <RecurringExpenseManager />;
      case "analytics":
        return <DashboardCharts expenses={expenses} />;
      case "decision":
        return <PacingAnalyzer expenses={expenses} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar />

      <div className="p-6">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
}

export default Dashboard;
