const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error in database connection:", err);
    throw err;
  }
  console.log("Connected to the database!");
  connection.release();
});

module.exports = db;
