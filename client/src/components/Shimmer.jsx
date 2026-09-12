/**
 * Shimmer/Skeleton Loading Component
 * Provides reusable shimmer animations for different UI elements
 */

// Base shimmer skeleton component
export function ShimmerBase({ className = "" }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] ${className}`}
    />
  );
}

// Card skeleton with header and content
export function ShimmerCard() {
  return (
    <div className="premium-card p-4 sm:p-6 space-y-4">
      <ShimmerBase className="h-6 w-3/4 rounded" />
      <ShimmerBase className="h-4 w-full rounded" />
      <ShimmerBase className="h-4 w-5/6 rounded" />
      <div className="flex gap-2 pt-4">
        <ShimmerBase className="h-8 w-20 rounded" />
        <ShimmerBase className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

// Summary cards row (for dashboard top cards)
export function ShimmerSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="premium-card p-4 sm:p-5 space-y-3">
          <ShimmerBase className="h-4 w-1/2 rounded" />
          <ShimmerBase className="h-7 w-2/3 rounded" />
          <ShimmerBase className="h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ShimmerChart() {
  return (
    <div className="premium-card p-4 sm:p-6 space-y-4">
      <ShimmerBase className="h-6 w-1/3 rounded" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-end gap-2 h-12">
            <ShimmerBase className="h-full w-12 rounded" />
            <ShimmerBase className="h-3/4 w-16 rounded" />
            <ShimmerBase className="h-1/2 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Table skeleton
export function ShimmerTable({ rows = 5, columns = 5 }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex gap-4 pb-4 mb-4 border-b border-white/10">
          {[...Array(columns)].map((_, i) => (
            <ShimmerBase key={i} className="h-4 flex-1 rounded" />
          ))}
        </div>
        {/* Rows */}
        <div className="space-y-4">
          {[...Array(rows)].map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4">
              {[...Array(columns)].map((_, colIdx) => (
                <ShimmerBase key={colIdx} className="h-4 flex-1 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// List item skeleton
export function ShimmerListItem() {
  return (
    <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <ShimmerBase className="h-5 w-2/3 rounded" />
          <ShimmerBase className="h-4 w-1/2 rounded" />
        </div>
        <ShimmerBase className="h-6 w-20 rounded" />
      </div>
    </div>
  );
}

// List skeleton (multiple items)
export function ShimmerList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <ShimmerListItem key={i} />
      ))}
    </div>
  );
}

// Expense form skeleton
export function ShimmerExpenseForm() {
  return (
    <div className="premium-card p-4 sm:p-6 space-y-4">
      <ShimmerBase className="h-6 w-1/2 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerBase className="h-3.5 w-1/3 rounded" />
            <ShimmerBase className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <ShimmerBase className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

// Dashboard grid skeleton
export function ShimmerDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <ShimmerSummaryCards />

      {/* Copilot skeleton */}
      <ShimmerCard />

      {/* Main split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ShimmerExpenseForm />
          <ShimmerTable rows={5} columns={4} />
        </div>
        <div>
          <ShimmerCard />
        </div>
      </div>
    </div>
  );
}

// Budget manager skeleton
export function ShimmerBudgetManager() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="premium-card p-4 space-y-3">
          <ShimmerBase className="h-4 w-1/3 rounded" />
          <ShimmerBase className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <ShimmerBase className="h-4 w-1/4 rounded" />
            <ShimmerBase className="h-4 w-1/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
