import { useState, useEffect, useCallback, useContext } from "react";
import API from "../services/api";
import { NotificationContext } from "../context/NotificationContext";

/* ─────────────────────────────────────────────
   HELPER UTILITIES
───────────────────────────────────────────── */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getCurrentMonthBounds() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  const totalDays = getDaysInMonth(year, month);
  const daysPassed = now.getDate();
  return { startDate, endDate, totalDays, daysPassed, year, month };
}

/* ─────────────────────────────────────────────
   SVG CIRCLE PROGRESS RING
───────────────────────────────────────────── */
function CircleRing({ percent, color, size = 80, stroke = 8, label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div className="text-lg font-bold text-gray-800">{Math.min(percent, 999).toFixed(0)}%</div>
        {label && <div className="text-xs text-gray-500">{label}</div>}
        {sublabel && <div className="text-[10px] text-gray-400">{sublabel}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION CARD WRAPPER
───────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/60 p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEASIBILITY BADGE
───────────────────────────────────────────── */
function FeasibilityBadge({ rating }) {
  if (rating === "safe")
    return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">🟢 Safe Purchase</span>;
  if (rating === "warning")
    return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">🟡 Proceed with Caution</span>;
  if (rating === "unsafe")
    return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold">🔴 Budget Breached</span>;
  return null;
}

/* ─────────────────────────────────────────────
   SAVINGS GOAL TRACKER
───────────────────────────────────────────── */
function SavingsGoalTracker({ pacing, purchaseCost }) {
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem("savingsGoal");
    return saved ? parseFloat(saved) : "";
  });
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(goal || "");

  const saveGoal = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val > 0) {
      setGoal(val);
      localStorage.setItem("savingsGoal", val);
    }
    setEditing(false);
  };

  const monthlyIncome = goal ? goal : null;
  const savingsRate = monthlyIncome && pacing ? ((monthlyIncome - pacing.totalSpent) / monthlyIncome) * 100 : null;
  const postPurchaseRate = monthlyIncome && pacing && purchaseCost
    ? ((monthlyIncome - pacing.totalSpent - purchaseCost) / monthlyIncome) * 100
    : null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">🎯 Savings Goal Tracker</h3>
        {!editing && (
          <button
            onClick={() => { setInputVal(goal || ""); setEditing(true); }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            {goal ? "Edit Goal" : "Set Goal"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex gap-2 items-center mb-4">
          <span className="text-gray-500 text-sm">Monthly Income / Budget Target ($)</span>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. 3000"
          />
          <button
            onClick={saveGoal}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      ) : !goal ? (
        <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
          💡 Set your monthly income or savings target to see how each purchase impacts your savings rate.
        </div>
      ) : null}

      {goal && pacing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-blue-700">${goal.toFixed(0)}</div>
              <div className="text-xs text-blue-500 mt-0.5">Monthly Target</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-red-700">${pacing.totalSpent.toFixed(0)}</div>
              <div className="text-xs text-red-500 mt-0.5">Total Spent</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-green-700">
                {savingsRate !== null ? `${Math.max(savingsRate, 0).toFixed(1)}%` : "—"}
              </div>
              <div className="text-xs text-green-500 mt-0.5">Current Savings Rate</div>
            </div>
            {purchaseCost > 0 && postPurchaseRate !== null && (
              <div className={`rounded-xl p-3 text-center ${postPurchaseRate < 0 ? "bg-red-100" : postPurchaseRate < savingsRate - 10 ? "bg-amber-50" : "bg-green-50"}`}>
                <div className={`text-xl font-extrabold ${postPurchaseRate < 0 ? "text-red-700" : "text-gray-700"}`}>
                  {Math.max(postPurchaseRate, 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Rate After Purchase</div>
              </div>
            )}
          </div>

          {savingsRate !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Savings Rate</span>
                <span>{Math.max(savingsRate, 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden relative">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
                {purchaseCost > 0 && postPurchaseRate !== null && (
                  <div
                    className="absolute top-0 h-full bg-red-400/60 rounded-full transition-all duration-700"
                    style={{
                      left: `${Math.min(Math.max(postPurchaseRate, 0), 100)}%`,
                      width: `${Math.max(Math.min(savingsRate, 100) - Math.max(postPurchaseRate, 0), 0)}%`
                    }}
                  />
                )}
              </div>
              {purchaseCost > 0 && postPurchaseRate !== null && savingsRate > postPurchaseRate && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ This purchase reduces your savings rate by {(savingsRate - postPurchaseRate).toFixed(1)} percentage points.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ─────────────────────────────────────────────
   DECISION HISTORY ITEM
───────────────────────────────────────────── */
function HistoryItem({ entry, onAddExpense }) {
  const ratingColors = {
    safe: "border-green-200 bg-green-50",
    warning: "border-amber-200 bg-amber-50",
    unsafe: "border-red-200 bg-red-50",
  };
  const ratingIcons = { safe: "🟢", warning: "🟡", unsafe: "🔴" };

  return (
    <div className={`border rounded-xl p-4 flex items-center justify-between gap-3 ${ratingColors[entry.rating]}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">{ratingIcons[entry.rating]}</span>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{entry.item}</p>
          <p className="text-xs text-gray-500">{entry.category} · ${entry.cost.toFixed(2)} · {entry.time}</p>
        </div>
      </div>
      {entry.rating !== "unsafe" && !entry.addedAsExpense && (
        <button
          onClick={() => onAddExpense(entry)}
          className="shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
        >
          + Add Expense
        </button>
      )}
      {entry.addedAsExpense && (
        <span className="shrink-0 text-xs bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg font-semibold">
          ✅ Added
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
function PacingAnalyzer({ expenses }) {
  const { addToast } = useContext(NotificationContext);

  // ── Budget Pacing State ──
  const [budgets, setBudgets] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [pacing, setPacing] = useState(null);
  const [categories, setCategories] = useState([]);

  // ── Decision Engine State ──
  const [item, setItem] = useState("");
  const [cost, setCost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [result, setResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [expenseAdded, setExpenseAdded] = useState(false);

  // ── Decision History State ──
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ── Load data ──
  const loadData = useCallback(async () => {
    try {
      const { startDate, endDate, totalDays, daysPassed } = getCurrentMonthBounds();

      const [budgetRes, expenseRes, categoryRes] = await Promise.all([
        API.get("/budgets"),
        API.get(`/expenses?startDate=${startDate}&endDate=${endDate}`),
        API.get("/categories"),
      ]);

      setBudgets(budgetRes.data);
      setMonthlyExpenses(expenseRes.data);
      setCategories(categoryRes.data);

      // ── Compute pacing ──
      const totalBudget = budgetRes.data.reduce((s, b) => s + Number(b.amount), 0);
      const totalSpent = expenseRes.data.reduce((s, e) => s + Number(e.amount), 0);

      const calendarProgress = (daysPassed / totalDays) * 100;
      const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const remaining = totalBudget - totalSpent;
      const daysLeft = totalDays - daysPassed;
      const dailySafeSpend = daysLeft > 0 ? remaining / daysLeft : 0;
      const isSpeeding = budgetProgress > calendarProgress;

      setPacing({
        calendarProgress,
        budgetProgress,
        totalBudget,
        totalSpent,
        remaining,
        daysLeft,
        dailySafeSpend,
        isSpeeding,
        daysPassed,
        totalDays,
      });
    } catch (err) {
      console.error("PacingAnalyzer load error:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, expenses]);

  // ── Decision Engine Analysis ──
  const analyze = (e) => {
    e.preventDefault();
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) return;

    setResult(null);
    setExpenseAdded(false);
    setAnalysisLoading(true);

    setTimeout(() => {
      const purchaseCost = Number(cost);

      // Find matching budget for selected category
      const matchedBudget = budgets.find(
        (b) =>
          b.category_name &&
          selectedCategory &&
          b.category_name.toLowerCase() === selectedCategory.toLowerCase()
      );

      // Spent in category this month
      const categorySpent = monthlyExpenses
        .filter((e) => e.category.toLowerCase() === selectedCategory.toLowerCase())
        .reduce((s, e) => s + Number(e.amount), 0);

      const postCategoryTotal = categorySpent + purchaseCost;
      const postTotal = (pacing?.totalSpent || 0) + purchaseCost;
      const totalBudget = pacing?.totalBudget || 0;
      const remaining = pacing?.remaining || 0;

      let rating = "safe";
      let reasons = [];
      let suggestions = [];
      let alternatives = [];

      // Check 1: Exceeds total budget
      if (purchaseCost > remaining) {
        rating = "unsafe";
        reasons.push(`This purchase ($${purchaseCost.toFixed(2)}) exceeds your remaining total budget ($${remaining.toFixed(2)}).`);

        // Smart alternative: what's the max safe amount?
        const safeMax = Math.max(remaining * 0.9, 0);
        if (safeMax > 0) {
          alternatives.push({
            type: "reduced_amount",
            label: `Consider spending $${safeMax.toFixed(2)} instead`,
            description: `This would keep you within 90% of your remaining budget and leave $${(remaining - safeMax).toFixed(2)} as a cushion.`,
          });
        }
        // Smart alternative: defer to next month
        alternatives.push({
          type: "defer",
          label: "Defer to next month",
          description: `Waiting until your next budget period starts gives you a fresh $${totalBudget.toFixed(2)} budget to work with.`,
        });
      }

      // Check 2: Exceeds category budget
      if (matchedBudget) {
        const catBudget = Number(matchedBudget.amount);
        const catRemaining = catBudget - categorySpent;
        if (purchaseCost > catRemaining) {
          if (rating !== "unsafe") rating = "warning";
          const overBy = purchaseCost - catRemaining;
          reasons.push(`This exceeds your ${selectedCategory} budget by $${overBy.toFixed(2)} ($${categorySpent.toFixed(2)} already spent of $${catBudget.toFixed(2)}).`);

          // Generate a trade-off suggestion
          const otherCats = monthlyExpenses
            .filter((e) => e.category.toLowerCase() !== selectedCategory.toLowerCase())
            .reduce((acc, e) => {
              acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
              return acc;
            }, {});

          const topOther = Object.entries(otherCats).sort((a, b) => b[1] - a[1])[0];
          if (topOther) {
            const weeksLeft = Math.ceil((pacing?.daysLeft || 7) / 7);
            const cutPerWeek = weeksLeft > 0 ? (overBy / weeksLeft).toFixed(2) : overBy.toFixed(2);
            suggestions.push(`💡 To absorb this, cut ${topOther[0]} by $${cutPerWeek}/week for the remaining ${weeksLeft} week(s).`);
          }

          // Safe alternative: max amount that fits in category budget
          if (catRemaining > 0) {
            alternatives.push({
              type: "reduced_amount",
              label: `Max safe amount for ${selectedCategory}: $${catRemaining.toFixed(2)}`,
              description: `Spending exactly $${catRemaining.toFixed(2)} would completely use your ${selectedCategory} budget without exceeding it.`,
            });
          }
        } else {
          reasons.push(`✅ Within ${selectedCategory} budget. You have $${catRemaining.toFixed(2)} remaining in this category.`);
        }
      } else if (!matchedBudget && selectedCategory) {
        // No budget set for category — warn but not block
        if (rating === "safe" && purchaseCost > (remaining * 0.5)) {
          rating = "warning";
          reasons.push(`No budget set for ${selectedCategory}. This purchase uses ${((purchaseCost / totalBudget) * 100).toFixed(1)}% of your total monthly budget.`);
          suggestions.push(`💡 Consider setting a monthly budget for "${selectedCategory}" to track this spending category precisely.`);
        } else if (rating === "safe") {
          reasons.push(`No specific budget for "${selectedCategory}", but this purchase is within your overall budget capacity.`);
        }
      }

      // Check 3: Safe daily spend pacing after purchase
      const daysLeft = pacing?.daysLeft || 1;
      const newDailySafe = daysLeft > 0 ? (remaining - purchaseCost) / daysLeft : 0;
      if (newDailySafe < 0 && rating === "safe") rating = "warning";

      if (rating === "safe") {
        reasons.push(`Great news! This purchase fits within your remaining budget of $${remaining.toFixed(2)}.`);
        suggestions.push(`✅ After this purchase, your safe daily spend limit becomes $${Math.max(newDailySafe, 0).toFixed(2)}/day for the remaining ${daysLeft} day(s).`);
      } else if (rating === "warning") {
        suggestions.push(`📅 You have ${daysLeft} day(s) left this month. Your remaining daily budget after this purchase: $${Math.max(newDailySafe, 0).toFixed(2)}/day.`);
      }

      // Check 4: Pacing impact
      if (pacing && pacing.isSpeeding && rating === "safe") {
        rating = "warning";
        reasons.push(`⚡ You are already spending faster than the calendar pace (${pacing.budgetProgress.toFixed(1)}% budget used vs ${pacing.calendarProgress.toFixed(1)}% of month elapsed).`);
        suggestions.push(`💡 To get back on track, limit spending to $${pacing.dailySafeSpend.toFixed(2)}/day for the rest of the month.`);
      }

      const newEntry = {
        id: Date.now(),
        item,
        cost: purchaseCost,
        category: selectedCategory,
        rating,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toISOString().split("T")[0],
        addedAsExpense: false,
      };

      setResult({
        rating,
        reasons,
        suggestions,
        alternatives,
        purchaseCost,
        categorySpent,
        postCategoryTotal,
        postTotal,
        totalBudget,
        matchedBudget,
        remaining,
        newDailySafe: Math.max(newDailySafe, 0),
        daysLeft,
        entry: newEntry,
      });

      setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
      setAnalysisLoading(false);

      // Fire a toast if unsafe or warning
      if (rating === "unsafe") {
        addToast(
          `Purchase Risk: ${item || "Item"}`,
          `$${purchaseCost.toFixed(2)} exceeds your remaining budget.`,
          "warning"
        );
      } else if (rating === "warning") {
        addToast(
          `Caution: ${item || "Item"}`,
          `This purchase requires careful consideration.`,
          "budget"
        );
      }
    }, 600);
  };

  // ── Add as Expense ──
  const handleAddAsExpense = async (entryOrResult) => {
    const entry = entryOrResult?.entry || entryOrResult;
    setAddingExpense(true);
    try {
      await API.post("/expenses", {
        title: entry.item,
        amount: entry.cost,
        category: entry.category,
        date: entry.date || new Date().toISOString().split("T")[0],
        notes: `Added via Decision Engine (${entry.rating} rating)`,
      });
      setExpenseAdded(true);
      setHistory((prev) =>
        prev.map((h) => (h.id === entry.id ? { ...h, addedAsExpense: true } : h))
      );
      addToast("Expense Added!", `${entry.item} ($${entry.cost.toFixed(2)}) has been recorded.`, "info");
      // Refresh data
      await loadData();
    } catch (err) {
      console.error("Error adding expense from Decision Engine:", err);
      addToast("Error", "Could not add expense. Please try manually.", "warning");
    }
    setAddingExpense(false);
  };

  // ── History Add as Expense ──
  const handleHistoryAddExpense = async (histEntry) => {
    try {
      await API.post("/expenses", {
        title: histEntry.item,
        amount: histEntry.cost,
        category: histEntry.category,
        date: histEntry.date || new Date().toISOString().split("T")[0],
        notes: `Added via Decision Engine history (${histEntry.rating} rating)`,
      });
      setHistory((prev) =>
        prev.map((h) => (h.id === histEntry.id ? { ...h, addedAsExpense: true } : h))
      );
      addToast("Expense Added!", `${histEntry.item} ($${histEntry.cost.toFixed(2)}) has been recorded.`, "info");
      await loadData();
    } catch (err) {
      console.error("Error adding expense from history:", err);
    }
  };

  /* ─── Pacing Speedometer Status ─── */
  const speedStatus = pacing
    ? pacing.isSpeeding
      ? { label: "⚡ Spending Too Fast", color: "text-red-600", bg: "bg-red-50 border-red-200" }
      : { label: "✅ On Track", color: "text-green-600", bg: "bg-green-50 border-green-200" }
    : null;

  /* ─── Category Breakdown Table ─── */
  const categoryBreakdown = budgets
    .filter((b) => b.category_name)
    .map((b) => {
      const spent = monthlyExpenses
        .filter((e) => e.category.toLowerCase() === b.category_name.toLowerCase())
        .reduce((s, e) => s + Number(e.amount), 0);
      const pct = Number(b.amount) > 0 ? (spent / Number(b.amount)) * 100 : 0;
      return {
        name: b.category_name,
        budget: Number(b.amount),
        spent,
        pct,
        remaining: Number(b.amount) - spent,
      };
    })
    .sort((a, b) => b.pct - a.pct);

  const purchaseCostNum = parseFloat(cost) || 0;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">⚖️ Decision Engine & Pacing Monitor</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time spending feasibility analysis based on your live budget data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition border border-purple-200 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100"
          >
            📜 History ({history.length})
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* ─────────────────────────── DECISION HISTORY ─────────────────────────── */}
      {showHistory && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">📜 Decision History</h3>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
              >
                Clear All
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              No decisions yet. Analyze a purchase to see it here.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <HistoryItem key={entry.id} entry={entry} onAddExpense={handleHistoryAddExpense} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ─────────────────────────── SECTION 1: Pacing Monitor ─────────────────────────── */}
      {pacing ? (
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-5">📊 Monthly Budget Pacing</h3>

          {/* Status Banner */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border mb-6 ${speedStatus?.bg}`}>
            <span className={`text-base font-semibold ${speedStatus?.color}`}>
              {speedStatus?.label}
            </span>
            <span className="text-sm text-gray-600">
              {pacing.daysPassed} of {pacing.totalDays} days elapsed ({pacing.calendarProgress.toFixed(0)}% of month)
            </span>
          </div>

          {/* Rings Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            <CircleRing
              percent={pacing.calendarProgress}
              color="#6366f1"
              label="Month Elapsed"
              sublabel={`${pacing.daysPassed}/${pacing.totalDays} days`}
            />
            <CircleRing
              percent={pacing.budgetProgress}
              color={pacing.isSpeeding ? "#ef4444" : "#10b981"}
              label="Budget Used"
              sublabel={`$${pacing.totalSpent.toFixed(0)} of $${pacing.totalBudget.toFixed(0)}`}
            />
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-3xl font-extrabold text-blue-600">${pacing.dailySafeSpend.toFixed(2)}</div>
              <div className="text-xs text-gray-500 text-center">Safe Daily Spend</div>
              <div className="text-[10px] text-gray-400">{pacing.daysLeft} days left</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className={`text-3xl font-extrabold ${pacing.remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                ${Math.abs(pacing.remaining).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 text-center">
                {pacing.remaining < 0 ? "Over Budget" : "Remaining"}
              </div>
              <div className="text-[10px] text-gray-400">this month</div>
            </div>
          </div>

          {/* Visual Pacing Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calendar Progress</span>
              <span>{pacing.calendarProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-indigo-400 transition-all duration-700"
                style={{ width: `${Math.min(pacing.calendarProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Budget Used</span>
              <span>{pacing.budgetProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  pacing.isSpeeding ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(pacing.budgetProgress, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="animate-pulse">
          <div className="h-32 bg-gray-100 rounded-lg" />
        </Card>
      )}

      {/* ─────────────────────────── SAVINGS GOAL TRACKER ─────────────────────────── */}
      <SavingsGoalTracker pacing={pacing} purchaseCost={purchaseCostNum} />

      {/* ─────────────────────────── SECTION 2: Category Breakdown ─────────────────────────── */}
      {categoryBreakdown.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🏷️ Category Budget Health</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => {
              const barColor =
                cat.pct >= 100 ? "bg-red-500" : cat.pct >= 85 ? "bg-amber-500" : "bg-green-500";
              const label =
                cat.pct >= 100 ? "🔴 Exceeded" : cat.pct >= 85 ? "🟡 Near Limit" : "🟢 Healthy";
              return (
                <div key={cat.name}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        ${cat.spent.toFixed(0)} / ${cat.budget.toFixed(0)}
                      </span>
                      <span className="text-xs">{label}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─────────────────────────── SECTION 3: Decision Engine Form ─────────────────────────── */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🤔 Can I Afford It?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Enter a potential purchase below. The engine instantly evaluates it against your live budget, pacing data, and savings goals.
        </p>

        <form onSubmit={analyze} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Item Name</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. New Headphones"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cost ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => { setCost(e.target.value); setResult(null); setExpenseAdded(false); }}
              placeholder="e.g. 149.99"
              min="0.01"
              step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setResult(null); setExpenseAdded(false); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={analysisLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-60 shadow-md shadow-blue-500/20"
            >
              {analysisLoading ? "Analyzing…" : "🔍 Analyze Purchase"}
            </button>
          </div>
        </form>

        {/* ─── Result Card ─── */}
        {result && (
          <div
            className={`rounded-xl border p-5 space-y-4 transition-all duration-300 ${
              result.rating === "safe"
                ? "bg-green-50 border-green-200"
                : result.rating === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {/* Badge & Item */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-base font-bold text-gray-800">{item}</h4>
                <p className="text-sm text-gray-500">
                  ${result.purchaseCost.toFixed(2)} · {selectedCategory}
                </p>
              </div>
              <FeasibilityBadge rating={result.rating} />
            </div>

            {/* Reasons */}
            <div className="space-y-1">
              {result.reasons.map((r, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {r}
                </p>
              ))}
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="space-y-1 border-t border-gray-200/60 pt-3">
                {result.suggestions.map((s, i) => (
                  <p key={i} className="text-sm font-medium text-gray-800">
                    {s}
                  </p>
                ))}
              </div>
            )}

            {/* Smart Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="space-y-2 border-t border-gray-200/60 pt-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">💡 Smart Alternatives</p>
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="bg-white/70 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-blue-700">{alt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alt.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comparison Mini Bars */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Budget Bar */}
              {result.matchedBudget && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {selectedCategory} Budget Impact
                  </p>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-blue-300 rounded-full"
                      style={{ width: `${Math.min((result.categorySpent / Number(result.matchedBudget.amount)) * 100, 100)}%` }}
                    />
                    <div
                      className="absolute h-full bg-blue-600 rounded-full opacity-70"
                      style={{
                        left: `${Math.min((result.categorySpent / Number(result.matchedBudget.amount)) * 100, 100)}%`,
                        width: `${Math.min((result.purchaseCost / Number(result.matchedBudget.amount)) * 100, 100 - Math.min((result.categorySpent / Number(result.matchedBudget.amount)) * 100, 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Current: ${result.categorySpent.toFixed(0)}</span>
                    <span>After: ${result.postCategoryTotal.toFixed(0)}</span>
                    <span>Limit: ${Number(result.matchedBudget.amount).toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Total Budget Bar */}
              {result.totalBudget > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Total Monthly Budget Impact
                  </p>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-purple-300 rounded-full"
                      style={{ width: `${Math.min(((pacing?.totalSpent || 0) / result.totalBudget) * 100, 100)}%` }}
                    />
                    <div
                      className="absolute h-full bg-purple-600 rounded-full opacity-70"
                      style={{
                        left: `${Math.min(((pacing?.totalSpent || 0) / result.totalBudget) * 100, 100)}%`,
                        width: `${Math.min((result.purchaseCost / result.totalBudget) * 100, 100 - Math.min(((pacing?.totalSpent || 0) / result.totalBudget) * 100, 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Current: ${(pacing?.totalSpent || 0).toFixed(0)}</span>
                    <span>After: ${result.postTotal.toFixed(0)}</span>
                    <span>Limit: ${result.totalBudget.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Post-Purchase Daily Safe Spend */}
            <div className={`text-sm font-semibold ${result.newDailySafe > 0 ? "text-gray-700" : "text-red-700"}`}>
              📆 New Safe Daily Spend after this purchase: ${result.newDailySafe.toFixed(2)}/day for {result.daysLeft} remaining day(s)
            </div>

            {/* ─── Add as Expense Button ─── */}
            {result.rating !== "unsafe" && (
              <div className="pt-2 border-t border-gray-200/60">
                {expenseAdded ? (
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <span>✅</span> Expense added to your tracker successfully!
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddAsExpense(result)}
                    disabled={addingExpense}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60 shadow-md shadow-blue-500/20"
                  >
                    {addingExpense ? "Adding…" : "➕ Add as Expense"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─────────────────────────── SECTION 4: Quick Spend Pulse (no budgets) ─────────────────────────── */}
      {pacing && pacing.totalBudget === 0 && (
        <Card>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">No Budgets Set</p>
              <p className="text-xs text-amber-700 mt-0.5">
                To unlock the full power of the Decision Engine, go to the <strong>Budgets</strong> tab and set monthly
                limits per category. The engine will then give you precise Safe/Warning/Unsafe ratings.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────── SECTION 5: Timeline Impact Analyzer ─────────────────────────── */}
      {categoryBreakdown.length > 0 && pacing && pacing.totalBudget > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🎯 Spending Impact Analyzer</h3>
          <p className="text-sm text-gray-500 mb-4">
            See how cutting each category's spending would free up daily budget for the rest of the month.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-3 py-2 rounded-tl-lg">Category</th>
                  <th className="px-3 py-2">Monthly Spend</th>
                  <th className="px-3 py-2">Cut 25%</th>
                  <th className="px-3 py-2">Cut 50%</th>
                  <th className="px-3 py-2 rounded-tr-lg">Daily Freed (50%)</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat, i) => {
                  const cut25 = cat.spent * 0.25;
                  const cut50 = cat.spent * 0.5;
                  const dailyFreed = pacing.daysLeft > 0 ? cut50 / pacing.daysLeft : 0;
                  return (
                    <tr key={cat.name} className={`border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-3 py-2 font-medium text-gray-800">{cat.name}</td>
                      <td className="px-3 py-2 text-gray-600">${cat.spent.toFixed(2)}</td>
                      <td className="px-3 py-2 text-green-600 font-medium">+${cut25.toFixed(2)}</td>
                      <td className="px-3 py-2 text-green-700 font-bold">+${cut50.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold text-xs">
                          +${dailyFreed.toFixed(2)}/day
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PacingAnalyzer;
