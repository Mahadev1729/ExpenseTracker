import { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { NotificationContext } from "../context/NotificationContext";
import { AuthContext } from "../context/context";
import NotificationInbox from "../components/NotificationInbox";

import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import DashboardCharts from "../components/DashboardCharts";
import SummaryCards from "../components/SummaryCards";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";
import RecurringExpenseManager from "../components/RecurringExpenseManager";
import PacingAnalyzer from "../components/PacingAnalyzer";
import AIFinancialCopilot from "../components/AIFinancialCopilot";
import { ShimmerDashboard } from "../components/Shimmer";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refresh: refreshNotifications } = useContext(NotificationContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const loadBudgetProgress = useCallback(async () => {
    try {
      const res = await API.get("/budgets/progress");
      setBudgetProgress(res.data);
    } catch (error) {
      console.error("Error loading budget progress:", error);
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/expenses");
      setExpenses(res.data);
      loadBudgetProgress();
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setIsLoading(false);
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
    { id: "decision", label: "Decision Engine", icon: "⚖️" },
  ];

  const renderTabContent = () => {
    if (isLoading && activeTab === "expenses") {
      return <ShimmerDashboard />;
    }

    switch (activeTab) {
      case "expenses":
        return (
          <div className="space-y-6">
            <SummaryCards expenses={expenses} isLoading={isLoading} />
            <AIFinancialCopilot
              expenses={expenses}
              budgetProgress={budgetProgress}
              isLoading={isLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ExpenseForm refresh={loadExpenses} isLoading={isLoading} />
                <ExpenseTable
                  expenses={expenses}
                  refresh={loadExpenses}
                  isLoading={isLoading}
                />
              </div>
              <div className="space-y-6">
                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>📊</span> Live Budget Progress
                  </h3>
                  {budgetProgress.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4 text-center">
                      No active budgets set. Go to the "Budgets" tab to create
                      one.
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
                            <div className="flex justify-between text-sm font-medium text-gray-300">
                              <span>
                                {budget.category_name || "All Categories"}
                              </span>
                              <span>
                                ${Number(budget.spent_amount).toFixed(2)} / $
                                {Number(budget.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{Math.round(progress)}% used</span>
                              {budget.end_date && (
                                <span>
                                  Ends{" "}
                                  {new Date(
                                    budget.end_date,
                                  ).toLocaleDateString()}
                                </span>
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
        return <DashboardCharts expenses={expenses} isLoading={isLoading} />;
      case "decision":
        return <PacingAnalyzer expenses={expenses} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#040404] text-gray-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden border-b border-white/10 bg-[#070707]/90 px-4 py-3 flex justify-between items-center shadow-sm z-30 sticky top-0 backdrop-blur-xl">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5">
          <span>💰</span> Expense Tracker
        </h1>
        <div className="flex items-center gap-3">
          <NotificationInbox />
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Open menu"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/35 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 border-r border-white/10 bg-[#060606]/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>💰</span> Smart Expense
            </h1>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#e2b84d] flex items-center justify-center text-black font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-3 transition duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Notification Bell & Logout */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Notification Inbox on Desktop */}
          <div className="hidden lg:flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-xs font-semibold text-gray-500 pl-2">
              Alerts
            </span>
            <NotificationInbox />
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-gradient-to-r hover:from-[#c9a227] hover:to-[#e2b84d] text-gray-200 hover:text-black py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition duration-200 border border-white/10"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
      </main>
    </div>
  );
}

export default Dashboard;
