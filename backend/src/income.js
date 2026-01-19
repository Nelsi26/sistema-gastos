import db from './db.js';

export function getAllIncome() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM income ORDER BY date DESC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function addIncome(income) {
  return new Promise((resolve, reject) => {
    const { description, amount, date } = income;
    db.run(
      "INSERT INTO income (description, amount, date) VALUES (?, ?, ?)",
      [description, amount, date],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...income });
      }
    );
  });
}

export function updateIncome(id, updates) {
  return new Promise((resolve, reject) => {
    const { description, amount, date } = updates;
    db.run(
      "UPDATE income SET description = ?, amount = ?, date = ? WHERE id = ?",
      [description, amount, date, id],
      function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error("Ingreso no encontrado"));
        else resolve({ id, ...updates });
      }
    );
  });
}

export function deleteIncome(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM income WHERE id = ?", [id], function(err) {
      if (err) reject(err);
      else if (this.changes === 0) reject(new Error("Ingreso no encontrado"));
      else resolve({ message: "Ingreso eliminado correctamente" });
    });
  });
}

export function getTotalIncome() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COALESCE(SUM(amount), 0) as total FROM income", [], (err, row) => {
      if (err) reject(err);
      else resolve(row ? Number(row.total) : 0);
    });
  });
}
