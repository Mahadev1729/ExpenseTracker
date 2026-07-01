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

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white/70 backdrop-blur-md border-b border-white/20 px-4 py-3 flex justify-between items-center shadow-sm z-30 sticky top-0">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1.5">
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
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white/35 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50 flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="pb-4 border-b border-gray-200/50">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <span>💰</span> Smart Expense
            </h1>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
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
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900 border border-transparent"
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
        <div className="pt-4 border-t border-gray-200/50 space-y-4">
          {/* Notification Inbox on Desktop */}
          <div className="hidden lg:flex items-center justify-between bg-white/30 p-2 rounded-xl border border-white/20">
            <span className="text-xs font-semibold text-gray-500 pl-2">Alerts</span>
            <NotificationInbox />
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition duration-200 border border-red-200/50"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
