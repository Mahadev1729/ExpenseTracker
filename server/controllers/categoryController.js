const categoryModel = require("../models/categoryModel");

const DEFAULT_CATEGORY_ICONS = {
    "bills & utilities": "💡",
    "bills": "💡",
    "utilities": "💡",
    "education": "🎓",
    "entertainment": "🎬",
    "food & dining": "🍔",
    "food": "🍔",
    "dining": "🍽️",
    "healthcare": "🏥",
    "health": "🏥",
    "medical": "💊",
    "shopping": "🛍️",
    "transportation": "🚗",
    "travel": "✈️",
    "groceries": "🛒",
    "salary": "💵",
    "investment": "📈",
    "personal": "👤",
    "other": "📦",
};

function sanitizeIcon(icon, name) {
    if (icon && icon !== "?" && icon !== "null" && icon.trim() !== "") {
        return icon;
    }
    const key = (name || "").toLowerCase().trim();
    return DEFAULT_CATEGORY_ICONS[key] || "";
}

exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const categories = await categoryModel.getCategoriesByUser(userId);
        const cleaned = categories.map((cat) => ({
            ...cat,
            icon: sanitizeIcon(cat.icon, cat.name),
        }));
        res.json(cleaned);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const categoryData = { ...req.body, user_id: userId };

        await categoryModel.addCategory(categoryData);
        res.json({ message: "Category added successfully" });
    } catch (error) {
        console.error("Add category error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = req.body;

        await categoryModel.updateCategory(id, categoryData);
        res.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await categoryModel.deleteCategory(id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
