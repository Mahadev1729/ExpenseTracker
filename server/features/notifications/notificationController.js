const notificationModel = require("./notificationModel");
const budgetModel = require("../budgets/budgetModel");
const recurringExpenseModel = require("../recurring/recurringExpenseModel");

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Run budget alerts scan safely (non-blocking)
        try {
            const budgets = await budgetModel.getBudgetProgress(userId);
            if (Array.isArray(budgets)) {
                for (const budget of budgets) {
                    const spent = Number(budget.spent_amount || 0);
                    const total = Number(budget.amount || 0);
                    if (total > 0) {
                        const percent = (spent / total) * 100;
                        if (percent >= 85) {
                            const status = percent >= 100 ? "exceeded" : "approaching limit";
                            const categoryName = budget.category_name || "All Categories";
                            await notificationModel.addNotification({
                                user_id: userId,
                                type: "budget",
                                title: `Budget Warning: ${categoryName}`,
                                message: `Spent $${spent.toFixed(2)} of $${total.toFixed(2)} budget for ${categoryName} (${percent.toFixed(1)}%). Status: ${status}.`
                            });
                        }
                    }
                }
            }
        } catch (budgetErr) {
            console.error("Budget alert scan error (non-fatal):", budgetErr.message);
        }

        // Run subscription alerts scan safely (non-blocking)
        try {
            const recurrings = await recurringExpenseModel.getRecurringExpensesByUser(userId);
            if (Array.isArray(recurrings)) {
                const today = new Date();
                today.setHours(0,0,0,0);
                for (const recurring of recurrings) {
                    if (recurring.next_due_date) {
                        const dueDate = new Date(recurring.next_due_date);
                        dueDate.setHours(0,0,0,0);
                        const diffTime = dueDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays >= 0 && diffDays <= 3) {
                            const when = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;
                            await notificationModel.addNotification({
                                user_id: userId,
                                type: "recurring",
                                title: `Bill Due: ${recurring.title}`,
                                message: `Payment of $${Number(recurring.amount || 0).toFixed(2)} for ${recurring.title} is due ${when}.`
                            });
                        }
                    }
                }
            }
        } catch (recurringErr) {
            console.error("Subscription alert scan error (non-fatal):", recurringErr.message);
        }

        // Fetch notifications list
        const notifications = await notificationModel.getNotificationsByUser(userId);
        res.json(Array.isArray(notifications) ? notifications : []);
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        await notificationModel.markAsRead(id, userId);
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.clearAll = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationModel.clearAllNotifications(userId);
        res.json({ message: "All notifications cleared" });
    } catch (error) {
        console.error("Clear all error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
