"# ExpenseTracker

This is a Smart Expense Tracker application built with React on the frontend and Node.js/Express on the backend. It helps users manage their expenses, set budgets, categorize spending, and track recurring expenses. Features include user authentication, dashboard with charts, expense forms, and PDF generation.

## Architecture

The application follows a client-server architecture:

- **Frontend**: React application built with Vite, using Tailwind CSS for styling. Components are organized in folders like components, pages, and context for state management.
- **Backend**: Node.js server using Express.js framework. It includes routes, controllers, models, and middleware for handling API requests.
- **Database**: MongoDB (or similar) for storing user data, expenses, budgets, and categories.
- **Authentication**: JWT-based authentication with middleware to protect routes.

## Application Flow

1. **User Registration/Login**: Users create an account or log in via the frontend, which sends requests to the backend for authentication.
2. **Dashboard**: After login, users are redirected to the dashboard showing summary cards, charts, and recent expenses.
3. **Expense Management**: Users can add, edit, or delete expenses through forms. Data is sent to the backend and stored in the database.
4. **Budget and Categories**: Users set budgets and manage categories, which are used to categorize expenses and track spending.
5. **Recurring Expenses**: Automated tracking of recurring expenses, with notifications or automatic entries.
6. **Reports**: Generate PDF reports of expenses for download.

## Features and How They Work

- **User Authentication**: Secure login and registration using JWT tokens. Protected routes ensure only authenticated users access data.
- **Expense Tracking**: Add expenses with details like amount, category, date. View in a table format on the dashboard.
- **Budget Management**: Set monthly budgets per category. Dashboard shows budget vs. actual spending.
- **Category Management**: Create and manage expense categories for better organization.
- **Recurring Expenses**: Set up expenses that repeat (e.g., monthly subscriptions) and track them automatically.
- **Dashboard Charts**: Visualize spending patterns with charts using libraries like Chart.js.
- **PDF Generation**: Export expense reports as PDF files for offline viewing or sharing." 
