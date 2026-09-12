const budgetModel = require("../models/budgetModel");

exports.getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgets = await budgetModel.getBudgetsByUser(userId);
        res.json(budgets);
    } catch (error) {
        console.error("Get budgets error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getBudgetProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { categoryId } = req.query;
        const progress = await budgetModel.getBudgetProgress(userId, categoryId);
        res.json(progress);
    } catch (error) {
        console.error("Get budget progress error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

function computeEndDate(startDate, period) {
    if (!startDate) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;
    const end = new Date(start);
    switch (period) {
        case "weekly":
            end.setDate(end.getDate() + 7);
            break;
        case "monthly":
            end.setMonth(end.getMonth() + 1);
            break;
        case "quarterly":
            end.setMonth(end.getMonth() + 3);
            break;
        case "yearly":
            end.setFullYear(end.getFullYear() + 1);
            break;
        default:
            end.setMonth(end.getMonth() + 1);
    }
    return end.toISOString().split("T")[0];
}

exports.addBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetData = { ...req.body, user_id: userId };
        // Convert empty category_id to null for All Categories
        if (!budgetData.category_id) {
            budgetData.category_id = null;
        }
        // If end_date is not provided, calculate it based on period
        if (!budgetData.end_date) {
            budgetData.end_date = computeEndDate(budgetData.start_date, budgetData.period);
        }

        if (!budgetData.amount || parseFloat(budgetData.amount) <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        await budgetModel.addBudget(budgetData);
        res.json({ message: "Budget added successfully" });
    } catch (error) {
        console.error("Add budget error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budgetData = { ...req.body };
        // Convert empty category_id to null for All Categories
        if (!budgetData.category_id) {
            budgetData.category_id = null;
        }
        if (!budgetData.end_date && budgetData.start_date && budgetData.period) {
            budgetData.end_date = computeEndDate(budgetData.start_date, budgetData.period);
        }

        if (budgetData.amount !== undefined && parseFloat(budgetData.amount) <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        await budgetModel.updateBudget(id, budgetData);
        res.json({ message: "Budget updated successfully" });
    } catch (error) {
        console.error("Update budget error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        await budgetModel.deleteBudget(id);
        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Delete budget error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
