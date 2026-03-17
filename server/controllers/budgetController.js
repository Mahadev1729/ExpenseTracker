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

exports.addBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetData = { ...req.body, user_id: userId };

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
        const budgetData = req.body;

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
