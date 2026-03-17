const recurringExpenseModel = require("../models/recurringExpenseModel");

exports.getRecurringExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const recurringExpenses = await recurringExpenseModel.getRecurringExpensesByUser(userId);
        res.json(recurringExpenses);
    } catch (error) {
        console.error("Get recurring expenses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addRecurringExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const recurringExpenseData = { ...req.body, user_id: userId };

        await recurringExpenseModel.addRecurringExpense(recurringExpenseData);
        res.json({ message: "Recurring expense added successfully" });
    } catch (error) {
        console.error("Add recurring expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateRecurringExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const recurringExpenseData = req.body;

        await recurringExpenseModel.updateRecurringExpense(id, recurringExpenseData);
        res.json({ message: "Recurring expense updated successfully" });
    } catch (error) {
        console.error("Update recurring expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteRecurringExpense = async (req, res) => {
    try {
        const { id } = req.params;

        await recurringExpenseModel.deleteRecurringExpense(id);
        res.json({ message: "Recurring expense deleted successfully" });
    } catch (error) {
        console.error("Delete recurring expense error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.processRecurringExpenses = async (req, res) => {
    try {
        const processed = await recurringExpenseModel.processRecurringExpenses();
        res.json({ message: `${processed} recurring expenses processed` });
    } catch (error) {
        console.error("Process recurring expenses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
