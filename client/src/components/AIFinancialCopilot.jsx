function AIFinancialCopilot({ expenses = [], budgetProgress = [] }) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const prevMonth = new Date(monthStart);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const currentMonthExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return (
      date >= monthStart &&
      date < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
    );
  });

  const previousMonthExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return (
      date >= new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1) &&
      date < new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1)
    );
  });

  const currentTotal = currentMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const previousTotal = previousMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const changePercent =
    previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    const name = expense.category || "Uncategorized";
    acc[name] = (acc[name] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const highestBudgetRisk = [...budgetProgress].sort(
    (a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0),
  )[0];

  const insights = [];
  if (changePercent > 15) {
    insights.push({
      type: "warning",
      title: "Spending is rising",
      body: `You are ${changePercent.toFixed(0)}% above last month’s spending. Consider trimming the biggest categories before the month ends.`,
    });
  } else if (changePercent < -10) {
    insights.push({
      type: "success",
      title: "Great control",
      body: `You spent ${Math.abs(changePercent).toFixed(0)}% less than last month. Your discipline is paying off.`,
    });
  }

  if (topCategory && currentTotal > 0 && topCategory[1] / currentTotal > 0.35) {
    insights.push({
      type: "info",
      title: "Category concentration",
      body: `${topCategory[0]} is taking ${((topCategory[1] / currentTotal) * 100).toFixed(0)}% of your current spending. That is a strong signal to review it closely.`,
    });
  }

  if (highestBudgetRisk && (highestBudgetRisk.progress_percentage || 0) >= 80) {
    insights.push({
      type: "warning",
      title: "Budget pressure detected",
      body: `${highestBudgetRisk.category_name || "A budget category"} is already at ${Math.round(highestBudgetRisk.progress_percentage || 0)}% of its limit.`,
    });
  }

  if (budgetProgress.length === 0 && currentTotal > 0) {
    insights.push({
      type: "info",
      title: "Set budgets for sharper control",
      body: "Add monthly budgets to turn these insights into active financial guardrails.",
    });
  }

  const suggestions = [];
  if (changePercent > 10) {
    suggestions.push(
      "Reduce discretionary spending this week to bring the month back in line.",
    );
  }
  if (highestBudgetRisk && (highestBudgetRisk.progress_percentage || 0) >= 80) {
    suggestions.push(
      "Delay non-essential purchases until the next review period.",
    );
  }
  if (topCategory && currentTotal > 0 && topCategory[1] / currentTotal > 0.3) {
    suggestions.push(
      `Try cutting ${topCategory[0]} by 10% to free up more room for your other goals.`,
    );
  }
  if (!suggestions.length) {
    suggestions.push(
      "Keep tracking your daily spending so the copilot can refine its next recommendation.",
    );
  }

  const score = Math.max(
    55,
    Math.min(
      95,
      85 - Math.max(0, changePercent / 2) - (highestBudgetRisk ? 5 : 0),
    ),
  );

  return (
    <div className="premium-card p-6 text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a227]">
            AI Financial Copilot
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            Your money assistant is watching your habits
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            The copilot reviews your latest spending, category pressure, and
            budget pacing to generate practical guidance.
          </p>
        </div>
        <div className="rounded-2xl border border-[#c9a227]/30 bg-gradient-to-br from-[#c9a227]/20 to-transparent px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Health score
          </p>
          <p className="text-3xl font-black">{score.toFixed(0)}/100</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                This month
              </p>
              <p className="mt-1 text-xl font-bold text-black">
                ₹{currentTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Last month
              </p>
              <p className="mt-1 text-xl font-bold text-black">
                ₹{previousTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Trend
              </p>
              <p
                className={`mt-1 text-xl font-bold ${changePercent > 0 ? "text-[#f0c75e]" : "text-emerald-400"}`}
              >
                {changePercent > 0 ? "+" : ""}
                {changePercent.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-sm font-semibold text-white">
                  {insight.title}
                </p>
                <p className="mt-1 text-sm text-gray-400">{insight.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#c9a227]/30 bg-gradient-to-br from-[#111111] to-[#1a1408] p-4 text-white">
          <p className="text-sm font-semibold">Recommended next move</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-2 rounded-lg bg-white/10 p-2">
                <span className="mt-0.5 text-base">✨</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AIFinancialCopilot;
