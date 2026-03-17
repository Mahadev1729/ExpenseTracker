const db = require("../config/db");

exports.getCategoriesByUser = async (userId) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name",
        [userId]
    );
    return rows;
};

exports.addCategory = async (category) => {
    const connection = await db;
    const { user_id, name, color, icon } = category;

    const [result] = await connection.execute(
        "INSERT INTO categories (user_id, name, color, icon) VALUES (?,?,?,?)",
        [user_id, name, color, icon]
    );

    return result;
};

exports.updateCategory = async (id, data) => {
    const connection = await db;
    const { name, color, icon } = data;

    const [result] = await connection.execute(
        "UPDATE categories SET name=?, color=?, icon=? WHERE id=?",
        [name, color, icon, id]
    );

    return result;
};

exports.deleteCategory = async (id) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM categories WHERE id=?",
        [id]
    );

    return result;
};
