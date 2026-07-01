/**
 * Shimmer/Skeleton Loading Component
 * Provides reusable shimmer animations for different UI elements
 */

// Base shimmer skeleton component
export function ShimmerBase({ className = "" }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
    />
  );
}

// Card skeleton with header and content
export function ShimmerCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-3">
          <ShimmerBase className="h-4 w-1/2 rounded" />
          <ShimmerBase className="h-8 w-2/3 rounded" />
          <ShimmerBase className="h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ShimmerChart() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex gap-4 pb-4 mb-4 border-b">
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
    <div className="bg-white rounded-lg p-4 space-y-3">
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
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <ShimmerBase className="h-6 w-1/2 rounded" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerBase className="h-4 w-1/4 rounded" />
            <ShimmerBase className="h-10 w-full rounded" />
          </div>
        ))}
      </div>
      <ShimmerBase className="h-10 w-full rounded" />
    </div>
  );
}

// Dashboard grid skeleton
export function ShimmerDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <ShimmerSummaryCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShimmerChart />
        <ShimmerChart />
      </div>

      {/* Tables/Lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShimmerTable rows={4} columns={3} />
        <ShimmerTable rows={4} columns={3} />
      </div>
    </div>
  );
}

// Budget manager skeleton
export function ShimmerBudgetManager() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 space-y-3">
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
