const db = require("../config/db");

exports.getRecurringExpensesByUser = async (userId) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT * FROM recurring_expenses WHERE user_id = ? ORDER BY next_due_date",
        [userId]
    );
    return rows;
};

exports.addRecurringExpense = async (recurringExpense) => {
    const connection = await db;
    const { user_id, title, amount, category, frequency, start_date, end_date, notes } = recurringExpense;

    const [result] = await connection.execute(
        "INSERT INTO recurring_expenses (user_id, title, amount, category, frequency, start_date, end_date, notes, next_due_date) VALUES (?,?,?,?,?,?,?,?,?)",
        [user_id, title, amount, category, frequency, start_date, end_date, notes, start_date]
    );

    return result;
};

exports.updateRecurringExpense = async (id, data) => {
    const connection = await db;
    const { title, amount, category, frequency, start_date, end_date, notes } = data;

    const [result] = await connection.execute(
        "UPDATE recurring_expenses SET title=?, amount=?, category=?, frequency=?, start_date=?, end_date=?, notes=? WHERE id=?",
        [title, amount, category, frequency, start_date, end_date, notes, id]
    );

    return result;
};

exports.deleteRecurringExpense = async (id) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM recurring_expenses WHERE id=?",
        [id]
    );

    return result;
};

exports.processRecurringExpenses = async () => {
    const connection = await db;
    const today = new Date().toISOString().split('T')[0];

    const [recurring] = await connection.execute(
        "SELECT * FROM recurring_expenses WHERE next_due_date <= ? AND (end_date IS NULL OR end_date >= ?)",
        [today, today]
    );

    for (const expense of recurring) {
        await connection.execute(
            "INSERT INTO expenses (user_id, title, amount, category, date, notes) VALUES (?,?,?,?,?,?)",
            [expense.user_id, expense.title, expense.amount, expense.category, expense.next_due_date, `Recurring: ${expense.notes || ''}`]
        );

        let nextDate = new Date(expense.next_due_date);
        switch (expense.frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        const nextDueDate = nextDate.toISOString().split('T')[0];
        await connection.execute(
            "UPDATE recurring_expenses SET next_due_date = ? WHERE id = ?",
            [nextDueDate, expense.id]
        );
    }

    return recurring.length;
};
