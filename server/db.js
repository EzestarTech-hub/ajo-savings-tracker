const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file location
const dbPath = path.join(__dirname, "database.sqlite");

// Create or connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create the tables
db.serialize(() => {

  // Groups table
  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contribution_amount REAL NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL
    )
  `);

  // Members table
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id)
    )
  `);

// Contributions table
db.run(`
  CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id)
  )
`);

// Payout Schedule table
db.run(`
    CREATE TABLE IF NOT EXISTS payout_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payout_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        FOREIGN KEY (group_id) REFERENCES groups(id),
        FOREIGN KEY (member_id) REFERENCES members(id)
    )
`);

// Payouts table
db.run(`
  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payout_date TEXT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id)
  )
`);


});

module.exports = db;