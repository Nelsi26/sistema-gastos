import sqlite3 from "sqlite3";

sqlite3.verbose();

const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      categoryId INTEGER,
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      containsText TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
