/**
 * ShimmerDemo Component
 * Demonstrates all available shimmer/skeleton loading states
 */

import {
  ShimmerBase,
  ShimmerCard,
  ShimmerSummaryCards,
  ShimmerChart,
  ShimmerTable,
  ShimmerList,
  ShimmerExpenseForm,
  ShimmerDashboard,
  ShimmerBudgetManager,
} from "./Shimmer";

export default function ShimmerDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Shimmer UI Components
      </h1>

      {/* Basic Shimmer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Basic Shimmer</h2>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <ShimmerBase className="h-6 rounded" />
          <ShimmerBase className="h-4 rounded" />
          <ShimmerBase className="h-4 w-3/4 rounded" />
        </div>
      </section>

      {/* Summary Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Summary Cards Skeleton
        </h2>
        <ShimmerSummaryCards />
      </section>

      {/* Chart Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Chart Skeleton
        </h2>
        <ShimmerChart />
      </section>

      {/* Table Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Table Skeleton
        </h2>
        <ShimmerTable rows={4} columns={5} />
      </section>

      {/* List Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">List Skeleton</h2>
        <ShimmerList items={5} />
      </section>

      {/* Form Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Form Skeleton</h2>
        <ShimmerExpenseForm />
      </section>

      {/* Budget Manager Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Budget Manager Skeleton
        </h2>
        <ShimmerBudgetManager />
      </section>

      {/* Full Dashboard Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Full Dashboard Skeleton
        </h2>
        <ShimmerDashboard />
      </section>

      {/* Card Skeleton */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Card Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
