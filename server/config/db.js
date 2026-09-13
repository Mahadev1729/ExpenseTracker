const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

if (process.env.MYSQL_URL) {
  // Railway / cloud connection URL
  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    ...poolConfig,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
} else {
  // Local development / Aiven host fallback
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    ...poolConfig,
  });
}

pool.getConnection()
  .then((conn) => {
    console.log("MySQL Connected (Connection Pool Active)");
    conn.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

module.exports = pool;

