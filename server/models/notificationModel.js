const db = require("../config/db");

exports.initialize = async () => {
    try {
        const connection = await db;
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Notifications table verified/created.");
    } catch (err) {
        console.error("Failed to initialize notifications table:", err);
    }
};

exports.getNotificationsByUser = async (userId) => {
    const connection = await db;
    const [rows] = await connection.execute(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        [userId]
    );
    return rows;
};

exports.addNotification = async (notification) => {
    const connection = await db;
    const { user_id, type, title, message } = notification;

    // Check duplicate in the last 24 hours to prevent spamming notifications on every page load
    const [existing] = await connection.execute(
        "SELECT id FROM notifications WHERE user_id = ? AND type = ? AND title = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)",
        [user_id, type, title]
    );

    if (existing.length > 0) {
        return null;
    }

    const [result] = await connection.execute(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)",
        [user_id, type, title, message]
    );
    return result;
};

exports.markAsRead = async (id, userId) => {
    const connection = await db;
    const [result] = await connection.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
        [id, userId]
    );
    return result;
};

exports.clearAllNotifications = async (userId) => {
    const connection = await db;
    const [result] = await connection.execute(
        "DELETE FROM notifications WHERE user_id = ?",
        [userId]
    );
    return result;
};
