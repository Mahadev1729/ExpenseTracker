const mysql = require("mysql2/promise");
require("dotenv").config();

let db;

if (process.env.MYSQL_URL) {
  // Railway provides a single connection URL
  db = mysql.createConnection(process.env.MYSQL_URL);
} else {
  // Local development fallback
  db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
}

db.then(() => {
    console.log("MySQL Connected");
}).catch((err) => {
    console.log("Database connection failed", err);
});

module.exports = db;
