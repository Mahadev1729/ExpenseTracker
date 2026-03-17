const expenseModel = require("../models/expenseModel");

exports.getExpenses = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            minAmount: req.query.minAmount,
            maxAmount: req.query.maxAmount,
            search: req.query.search,
            limit: req.query.limit ? parseInt(req.query.limit) : null
        };

        const expenses = await expenseModel.getExpensesByUser(req.user.id, filters);
        res.json(expenses);
    } catch (error) {
        console.error("Get expenses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getExpenseStats = async (req, res) => {
    try {
        const { period } = req.query;
        const stats = await expenseModel.getExpenseStats(req.user.id, period);
        res.json(stats);
    } catch (error) {
        console.error("Get expense stats error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getExpensesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const expenses = await expenseModel.getExpensesByDateRange(req.user.id, startDate, endDate);
        res.json(expenses);
    } catch (error) {
        console.error("Get expenses by date range error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.exportExpenses = async (req, res) => {
    try {
        const { format } = req.query;
        const filters = {
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            minAmount: req.query.minAmount,
            maxAmount: req.query.maxAmount,
            search: req.query.search
        };

        const data = await expenseModel.exportExpenses(req.user.id, format, filters);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=expenses.json');
        }

        res.send(data);
    } catch (error) {
        console.error("Export expenses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const expense = {
            user_id: req.user.id,
            ...req.body
        };

        await expenseModel.addExpense(expense);

        res.json({ message: "Expense added successfully" });
    } catch (error) {
        console.error("Add expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        await expenseModel.updateExpense(req.params.id, req.body);
        res.json({ message: "Expense updated" });
    } catch (error) {
        console.error("Update expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await expenseModel.deleteExpense(req.params.id);
        res.json({ message: "Expense deleted" });
    } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
