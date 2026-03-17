const db = require("../config/db");

exports.getBudgetsByUser = async (userId) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT b.*, c.name as category_name, c.color, c.icon FROM budgets b LEFT JOIN categories c ON b.category_id = c.id WHERE b.user_id = ? ORDER BY b.created_at DESC",
        [userId]
    );
    return rows;
};

exports.addBudget = async (budget) => {
    const connection = await db;
    const { user_id, category_id, amount, period, start_date, end_date } = budget;

    const [result] = await connection.execute(
        "INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) VALUES (?,?,?,?,?,?)",
        [user_id, category_id, amount, period, start_date, end_date]
    );

    return result;
};

exports.updateBudget = async (id, data) => {
    const connection = await db;
    const { category_id, amount, period, start_date, end_date } = data;

    const [result] = await connection.execute(
        "UPDATE budgets SET category_id=?, amount=?, period=?, start_date=?, end_date=? WHERE id=?",
        [category_id, amount, period, start_date, end_date, id]
    );

    return result;
};

exports.deleteBudget = async (id) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM budgets WHERE id=?",
        [id]
    );

    return result;
};

exports.getBudgetProgress = async (userId, categoryId = null) => {
    const connection = await db;
    let query = `
        SELECT b.*, c.name as category_name,
               COALESCE(SUM(e.amount), 0) as spent_amount,
               (COALESCE(SUM(e.amount), 0) / b.amount) * 100 as progress_percentage
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN expenses e ON e.category = c.name AND e.user_id = b.user_id
        AND e.date BETWEEN b.start_date AND b.end_date
        WHERE b.user_id = ?
    `;

    const params = [userId];

    if (categoryId) {
        query += " AND b.category_id = ?";
        params.push(categoryId);
    }

    query += " GROUP BY b.id";

    const [rows] = await connection.execute(query, params);
    return rows;
};
