import { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { NotificationContext } from "../context/NotificationContext";
import { AuthContext } from "../context/context";
import { useTheme } from "../context/ThemeContext";
import NotificationInbox from "../components/shared/NotificationInbox";
import PWAInstallPrompt from "../components/shared/PWAInstallPrompt";

import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseTable from "../components/expenses/ExpenseTable";
import DashboardCharts from "../components/analytics/DashboardCharts";
import SummaryCards from "../components/analytics/SummaryCards";
import CategoryManager from "../components/expenses/CategoryManager";
import BudgetManager from "../components/budgets/BudgetManager";
import RecurringExpenseManager from "../components/expenses/RecurringExpenseManager";
import PacingAnalyzer from "../components/analytics/PacingAnalyzer";
import AIFinancialCopilot from "../components/analytics/AIFinancialCopilot";
import IncomeManager from "../components/income/IncomeManager";
import ReportsManager from "../components/reports/ReportsManager";
import { ShimmerDashboard } from "../components/shared/Shimmer";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refresh: refreshNotifications } = useContext(NotificationContext);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const loadIncomes = useCallback(async () => {
    try {
      const res = await API.get("/incomes");
      setIncomes(res.data);
    } catch (error) {
      console.error("Error loading incomes:", error);
    }
  }, []);

  const loadBudgetProgress = useCallback(async () => {
    try {
      const res = await API.get("/budgets/progress");
      setBudgetProgress(res.data);
    } catch (error) {
      console.error("Error loading budget progress:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const loadExpenses = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const res = await API.get("/expenses");
      setExpenses(res.data);
      loadBudgetProgress();
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [refreshNotifications, loadBudgetProgress]);

  useEffect(() => {
    loadExpenses(true);
    loadIncomes();
    loadCategories();
  }, [loadExpenses, loadIncomes, loadCategories]);

  const tabs = [
    { id: "expenses", label: "Expenses", icon: "💰" },
    { id: "income", label: "Income", icon: "💵" },
    { id: "categories", label: "Categories", icon: "🏷️" },
    { id: "budgets", label: "Budgets", icon: "📊" },
    { id: "recurring", label: "Recurring", icon: "🔄" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "reports", label: "Reports & Export", icon: "📑" },
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
            <SummaryCards expenses={expenses} incomes={incomes} isLoading={isLoading} />
            <AIFinancialCopilot
              expenses={expenses}
              budgetProgress={budgetProgress}
              isLoading={isLoading}
            />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
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
      case "income":
        return <IncomeManager incomes={incomes} refresh={loadIncomes} />;
      case "categories":
        return <CategoryManager />;
      case "budgets":
        return <BudgetManager />;
      case "recurring":
        return <RecurringExpenseManager />;
      case "analytics":
        return <DashboardCharts expenses={expenses} isLoading={isLoading} />;
      case "reports":
        return (
          <ReportsManager
            expenses={expenses}
            incomes={incomes}
            budgets={budgetProgress}
            categories={categories}
            user={user}
          />
        );
      case "decision":
        return <PacingAnalyzer expenses={expenses} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "var(--bg-root)", color: "var(--text-primary)" }}
    >
      {/* Mobile Top Header */}
      <div
        className="lg:hidden px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center shadow-sm z-30 sticky top-0 backdrop-blur-xl"
        style={{
          backgroundColor: "var(--bg-sidebar)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1 className="text-base sm:text-xl font-extrabold flex items-center gap-1.5 min-w-0 truncate" style={{ color: "var(--text-heading)" }}>
          <span>💰</span> <span className="truncate">Expense Tracker</span>
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Theme toggle — mobile */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn !w-8 !h-8 sm:!w-10 sm:!h-10"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="text-base sm:text-lg transition-transform duration-300" style={{ display: "block" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </button>
          <NotificationInbox />
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 sm:p-2 focus:outline-none rounded-lg"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Open menu"
          >
            <span className="text-xl sm:text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`sidebar-bg fixed top-0 bottom-0 left-0 w-72 sm:w-64 max-w-[85vw] backdrop-blur-xl z-50 flex flex-col justify-between p-5 sm:p-6 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h1 className="text-xl font-extrabold flex items-center gap-2" style={{ color: "var(--text-heading)" }}>
              <span>💰</span> Smart Expense
            </h1>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white transition"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* User Profile Card */}
          {user && (
            <div
              className="p-4 rounded-xl shadow-sm flex items-center gap-3"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#e2b84d] flex items-center justify-center text-black font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-heading)" }}>
                  {user.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
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

        {/* Footer Area with Notification Bell, Theme Toggle & Logout */}
        <div className="pt-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Notification + Theme Toggle Row on Desktop */}
          <div
            className="hidden lg:flex items-center justify-between p-2 rounded-xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <span className="text-xs font-semibold pl-2" style={{ color: "var(--text-muted)" }}>
              Alerts
            </span>
            <div className="flex items-center gap-1">
              {/* Theme toggle — desktop */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <NotificationInbox />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(to right, #c9a227, #e2b84d)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-3 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default Dashboard;
