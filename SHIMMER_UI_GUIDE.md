# Shimmer UI Integration Guide

## Overview

The Shimmer UI component library provides reusable skeleton loading states for your Expense Tracker application. These components use CSS animations to create a smooth, engaging loading experience.

## Components Available

### 1. **ShimmerBase** - Foundation Component

Basic shimmer block for custom layouts.

```jsx
import { ShimmerBase } from "./components/Shimmer";

<ShimmerBase className="h-6 w-3/4 rounded" />;
```

### 2. **ShimmerCard** - Single Card Skeleton

Perfect for loading individual cards with header and content.

```jsx
import { ShimmerCard } from "./components/Shimmer";

<ShimmerCard />;
```

### 3. **ShimmerSummaryCards** - Dashboard Summary Cards

Shows 4 skeleton cards in a responsive grid.

```jsx
import { ShimmerSummaryCards } from "./components/Shimmer";

<ShimmerSummaryCards />;
```

### 4. **ShimmerChart** - Chart Skeleton

Simulates a bar/line chart loading state.

```jsx
import { ShimmerChart } from "./components/Shimmer";

<ShimmerChart />;
```

### 5. **ShimmerTable** - Table Skeleton

Customizable table with rows and columns.

```jsx
import { ShimmerTable } from './components/Shimmer';

// Default: 5 rows, 5 columns
<ShimmerTable />

// Custom dimensions
<ShimmerTable rows={10} columns={6} />
```

### 6. **ShimmerList** - List Items Skeleton

Multiple list item skeletons.

```jsx
import { ShimmerList } from './components/Shimmer';

// Default: 5 items
<ShimmerList />

// Custom count
<ShimmerList items={10} />
```

### 7. **ShimmerExpenseForm** - Form Skeleton

Shows a form loading state with inputs and button.

```jsx
import { ShimmerExpenseForm } from "./components/Shimmer";

<ShimmerExpenseForm />;
```

### 8. **ShimmerBudgetManager** - Budget Manager Skeleton

Shows budget items loading state.

```jsx
import { ShimmerBudgetManager } from "./components/Shimmer";

<ShimmerBudgetManager />;
```

### 9. **ShimmerDashboard** - Full Dashboard Skeleton

Complete dashboard layout with multiple sections.

```jsx
import { ShimmerDashboard } from "./components/Shimmer";

<ShimmerDashboard />;
```

## Real-World Integration Examples

### Example 1: Dashboard Component with Loading State

```jsx
import { useState, useEffect } from 'react';
import { ShimmerDashboard, ShimmerSummaryCards } from './Shimmer';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        expenses: [...],
        budgets: [...]
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div>
      {isLoading ? (
        <ShimmerDashboard />
      ) : (
        <div>
          {/* Your actual dashboard content */}
        </div>
      )}
    </div>
  );
}
```

### Example 2: Table Component with Skeleton

```jsx
import { ShimmerTable } from "./Shimmer";

export default function ExpenseTable({ expenses, isLoading }) {
  if (isLoading) {
    return <ShimmerTable rows={8} columns={5} />;
  }

  return <table>{/* Your table content */}</table>;
}
```

### Example 3: Budget Manager with Loading State

```jsx
import { ShimmerBudgetManager } from "./Shimmer";

export default function BudgetManager({ budgets, isLoading }) {
  if (isLoading) {
    return <ShimmerBudgetManager />;
  }

  return <div>{/* Your budget content */}</div>;
}
```

### Example 4: Expense Form with Skeleton

```jsx
import { ShimmerExpenseForm } from "./Shimmer";

export default function ExpenseForm({ isLoading }) {
  if (isLoading) {
    return <ShimmerExpenseForm />;
  }

  return <form>{/* Your form fields */}</form>;
}
```

### Example 5: List with Conditional Skeleton

```jsx
import { ShimmerList } from "./Shimmer";

export default function TransactionList({ transactions, isLoading }) {
  return (
    <div>
      {isLoading ? (
        <ShimmerList items={5} />
      ) : (
        <div>
          {transactions.map((transaction) => (
            <div key={transaction.id}>{/* Transaction item */}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Styling Options

All shimmer components support Tailwind CSS classes through the `className` prop:

```jsx
// Custom size
<ShimmerBase className="h-12 w-32" />

// Custom radius
<ShimmerBase className="rounded-full" />

// Multiple classes
<ShimmerBase className="h-8 w-full rounded-lg" />
```

## Performance Tips

1. **Only show shimmer during actual loading**: Avoid unnecessary animations
2. **Use appropriate skeleton complexity**: Match your actual content structure
3. **Set reasonable timeouts**: Prevent skeleton from showing too long
4. **Consider user experience**: Add loading states consistently across the app

## Animation Customization

The shimmer animation is defined in `tailwind.config.js`:

```js
animation: {
  shimmer: "shimmer 2s infinite",
},
keyframes: {
  shimmer: {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "calc(200% + 1px) 0" },
  },
}
```

To adjust animation speed, change the `2s` value to your preference:

- `1.5s` - Faster shimmer
- `2s` - Default (recommended)
- `3s` - Slower shimmer

## Best Practices

1. **Match your layout**: Create skeleton layouts that match your actual content structure
2. **Consistent timing**: Use the same loading animation duration across the app
3. **Meaningful content**: Show realistic skeleton states (e.g., text lengths, spacing)
4. **Accessibility**: Consider users with motion sensitivity; provide options to reduce animations if needed

## Testing the Shimmer UI

Visit the demo page to see all components in action:

```jsx
import ShimmerDemo from "./components/ShimmerDemo";

// In your App.jsx or routing
<Route path="/shimmer-demo" element={<ShimmerDemo />} />;
```

Then navigate to `http://localhost:5173/shimmer-demo`
