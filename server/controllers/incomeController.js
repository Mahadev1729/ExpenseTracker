const incomeModel = require("../models/incomeModel");

exports.getIncomes = async (req, res) => {
    try {
        const userId = req.user.id;
        const incomes = await incomeModel.getIncomesByUser(userId);
        res.json(incomes);
    } catch (error) {
        console.error("Get incomes error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { source, amount, category, date, notes } = req.body;

        if (!source || !source.trim()) {
            return res.status(400).json({ message: "Source title is required" });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        const incomeData = {
            user_id: userId,
            source: source.trim(),
            amount: parsedAmount,
            category: category || "Salary",
            date: date || new Date().toISOString().split("T")[0],
            notes: notes || ""
        };

        const result = await incomeModel.addIncome(incomeData);
        res.status(201).json({ message: "Income added successfully", id: result.insertId });
    } catch (error) {
        console.error("Add income error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { source, amount, category, date, notes } = req.body;

        if (!source || !source.trim()) {
            return res.status(400).json({ message: "Source title is required" });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        const incomeData = {
            source: source.trim(),
            amount: parsedAmount,
            category: category || "Salary",
            date: date || new Date().toISOString().split("T")[0],
            notes: notes || ""
        };

        await incomeModel.updateIncome(id, incomeData);
        res.json({ message: "Income updated successfully" });
    } catch (error) {
        console.error("Update income error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;
        await incomeModel.deleteIncome(id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        console.error("Delete income error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
