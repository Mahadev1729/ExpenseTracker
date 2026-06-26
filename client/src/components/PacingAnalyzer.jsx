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
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 ${className}`}>
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

      // Check 1: Exceeds total budget
      if (purchaseCost > remaining) {
        rating = "unsafe";
        reasons.push(`This purchase ($${purchaseCost.toFixed(2)}) exceeds your remaining total budget ($${remaining.toFixed(2)}).`);
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
        }
      } else if (!matchedBudget && selectedCategory) {
        // No budget set for category — warn but not block
        if (rating === "safe" && purchaseCost > (remaining * 0.5)) {
          rating = "warning";
          reasons.push(`No budget set for ${selectedCategory}. This purchase uses ${((purchaseCost / totalBudget) * 100).toFixed(1)}% of your total monthly budget.`);
        }
      }

      // Check 3: Safe daily spend pacing after purchase
      const daysLeft = pacing?.daysLeft || 1;
      const newDailySafe = daysLeft > 0 ? (remaining - purchaseCost) / daysLeft : 0;
      if (newDailySafe < 0 && rating === "safe") rating = "warning";

      if (rating === "safe") {
        reasons.push(`Great news! This purchase fits within your remaining budget of $${remaining.toFixed(2)}.`);
        suggestions.push(`✅ After this purchase, your safe daily spend limit becomes $${Math.max(newDailySafe, 0).toFixed(2)}/day for the remaining ${daysLeft} day(s).`);
      }

      setResult({
        rating,
        reasons,
        suggestions,
        purchaseCost,
        categorySpent,
        postCategoryTotal,
        postTotal,
        totalBudget,
        matchedBudget,
        remaining,
        newDailySafe: Math.max(newDailySafe, 0),
        daysLeft,
      });

      setAnalysisLoading(false);

      // Fire a toast if unsafe or warning
      if (rating === "unsafe") {
        addToast(
          `Purchase Risk: ${item || "Item"}`,
          `$${purchaseCost.toFixed(2)} exceeds your remaining budget.`,
          "warning"
        );
      }
    }, 600);
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

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">⚖️ Decision Engine & Pacing Monitor</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time spending feasibility analysis based on your live budget data.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
        >
          🔄 Refresh Data
        </button>
      </div>

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

      {/* ─────────────────────────── SECTION 3: Decision Engine ─────────────────────────── */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🤔 Can I Afford It?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Enter a potential purchase below. The engine instantly evaluates it against your live budget and pacing data.
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
              onChange={(e) => { setCost(e.target.value); setResult(null); }}
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
              onChange={(e) => { setSelectedCategory(e.target.value); setResult(null); }}
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
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-60"
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
              <div className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <p key={i} className="text-sm font-medium text-gray-800">
                    {s}
                  </p>
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
                  <th className="px-3 py-2">Monthly Avg</th>
                  <th className="px-3 py-2">Cut 25%</th>
                  <th className="px-3 py-2">Cut 50%</th>
                  <th className="px-3 py-2 rounded-tr-lg">Daily Freed (50% cut)</th>
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
