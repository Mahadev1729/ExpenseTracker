const db = require("../config/db");

exports.findUserByEmail = async (email) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows[0];
};

exports.createUser = async (name, email, password) => {
    const connection = await db;
    const [result] = await connection.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password]
    );
    return result;
};
