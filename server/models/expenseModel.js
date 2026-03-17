const db = require("../config/db");

exports.getExpensesByUser = async (userId, filters = {}) => {
    const connection = await db;
    let query = "SELECT * FROM expenses WHERE user_id = ?";
    const params = [userId];

    if (filters.category) {
        query += " AND category = ?";
        params.push(filters.category);
    }

    if (filters.startDate) {
        query += " AND date >= ?";
        params.push(filters.startDate);
    }

    if (filters.endDate) {
        query += " AND date <= ?";
        params.push(filters.endDate);
    }

    if (filters.minAmount) {
        query += " AND amount >= ?";
        params.push(filters.minAmount);
    }

    if (filters.maxAmount) {
        query += " AND amount <= ?";
        params.push(filters.maxAmount);
    }

    if (filters.search) {
        query += " AND (title LIKE ? OR notes LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY date DESC";

    if (filters.limit) {
        query += " LIMIT ?";
        params.push(filters.limit);
    }

    const [rows] = await connection.execute(query, params);
    return rows;
};

exports.getExpenseStats = async (userId, period = 'month') => {
    const connection = await db;
    let dateFilter = "";

    switch (period) {
        case 'week':
            dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            break;
        case 'quarter':
            dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
            break;
        case 'year':
            dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
            break;
    }

    const [stats] = await connection.execute(`
        SELECT
            COUNT(*) as total_expenses,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            MAX(amount) as max_amount,
            MIN(amount) as min_amount,
            category,
            COUNT(*) as category_count
        FROM expenses
        WHERE user_id = ? ${dateFilter}
        GROUP BY category
        ORDER BY total_amount DESC
    `, [userId]);

    return stats;
};

exports.getExpensesByDateRange = async (userId, startDate, endDate) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT DATE(date) as date, SUM(amount) as total_amount, COUNT(*) as expense_count FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY DATE(date) ORDER BY date",
        [userId, startDate, endDate]
    );
    return rows;
};

exports.addExpense = async (expense) => {
    const connection = await db;
    const { user_id, title, amount, category, date, notes } = expense;

    const [result] = await connection.execute(
        "INSERT INTO expenses (user_id,title,amount,category,date,notes) VALUES (?,?,?,?,?,?)",
        [user_id, title, amount, category, date, notes]
    );

    return result;
};

exports.updateExpense = async (id, data) => {
    const connection = await db;
    const { title, amount, category, date, notes } = data;

    const [result] = await connection.execute(
        "UPDATE expenses SET title=?,amount=?,category=?,date=?,notes=? WHERE id=?",
        [title, amount, category, date, notes, id]
    );

    return result;
};

exports.deleteExpense = async (id) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM expenses WHERE id=?",
        [id]
    );

    return result;
};

exports.exportExpenses = async (userId, format = 'json', filters = {}) => {
    const expenses = await this.getExpensesByUser(userId, filters);

    if (format === 'csv') {
        const csvHeader = 'ID,Title,Amount,Category,Date,Notes\n';
        const csvRows = expenses.map(expense =>
            `${expense.id},"${expense.title}",${expense.amount},"${expense.category}","${expense.date}","${expense.notes || ''}"`
        ).join('\n');
        return csvHeader + csvRows;
    }

    return JSON.stringify(expenses, null, 2);
};
