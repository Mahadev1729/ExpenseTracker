const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./features/auth/authRoutes");
const expenseRoutes = require("./features/expenses/expenseRoutes");
const categoryRoutes = require("./features/categories/categoryRoutes");
const budgetRoutes = require("./features/budgets/budgetRoutes");
const recurringExpenseRoutes = require("./features/recurring/recurringExpenseRoutes");
const notificationRoutes = require("./features/notifications/notificationRoutes");
const incomeRoutes = require("./features/incomes/incomeRoutes");
const notificationModel = require("./features/notifications/notificationModel");
const incomeModel = require("./features/incomes/incomeModel");

// Auto-initialize Notifications & Incomes Tables
notificationModel.initialize();
incomeModel.initialize();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmed = url.trim().replace(/\/$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring-expenses", recurringExpenseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/incomes", incomeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
