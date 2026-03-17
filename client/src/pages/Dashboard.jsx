import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import DashboardCharts from "../components/DashboardCharts";
import SummaryCards from "../components/SummaryCards";
import CategoryManager from "../components/CategoryManager";
import BudgetManager from "../components/BudgetManager";
import RecurringExpenseManager from "../components/RecurringExpenseManager";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");

  const loadExpenses = useCallback(async () => {
    const res = await API.get("/expenses");
    setExpenses(res.data);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const tabs = [
    { id: "expenses", label: "Expenses", icon: "💰" },
    { id: "categories", label: "Categories", icon: "🏷️" },
    { id: "budgets", label: "Budgets", icon: "📊" },
    { id: "recurring", label: "Recurring", icon: "🔄" },
    { id: "analytics", label: "Analytics", icon: "📈" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "expenses":
        return (
          <div className="space-y-6">
            <SummaryCards expenses={expenses} />
            <ExpenseForm refresh={loadExpenses} />
            <ExpenseTable expenses={expenses} refresh={loadExpenses} />
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
