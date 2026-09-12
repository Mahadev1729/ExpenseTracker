const db = require("../config/db");

exports.initialize = async () => {
    try {
        const connection = await db;
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS incomes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                source VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL DEFAULT 'Salary',
                date DATE NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Incomes table verified/created.");
    } catch (err) {
        console.error("Failed to initialize incomes table:", err);
    }
};

exports.getIncomesByUser = async (userId) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC, id DESC",
        [userId]
    );
    return rows;
};

exports.addIncome = async (incomeData) => {
    const connection = await db;
    const { user_id, source, amount, category, date, notes } = incomeData;
    const [result] = await connection.execute(
        "INSERT INTO incomes (user_id, source, amount, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, source, amount, category || "Salary", date, notes || ""]
    );
    return result;
};

exports.updateIncome = async (id, incomeData) => {
    const connection = await db;
    const { source, amount, category, date, notes } = incomeData;
    const [result] = await connection.execute(
        "UPDATE incomes SET source = ?, amount = ?, category = ?, date = ?, notes = ? WHERE id = ?",
        [source, amount, category || "Salary", date, notes || "", id]
    );
    return result;
};

exports.deleteIncome = async (id) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM incomes WHERE id = ?",
        [id]
    );
    return result;
};
