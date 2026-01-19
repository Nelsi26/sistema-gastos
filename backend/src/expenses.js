import db from "./db.js";

// Obtener todos los gastos con totales y categorías
export function getAllExpenses() {
  return new Promise((resolve, reject) => {
    // Primero obtenemos todos los gastos con la información de categoría
    db.all(`
      SELECT e.*, c.name as categoryName, c.color as categoryColor 
      FROM expenses e
      LEFT JOIN categories c ON e.categoryId = c.id
      ORDER BY e.date DESC
    `, (err, expenses) => {
      if (err) return reject(err);
      
      // Calcular el total de gastos
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Agrupar por categoría
      const categories = {};
      expenses.forEach(expense => {
        const categoryId = expense.categoryId || 'sin-categoria';
        const categoryName = expense.categoryName || 'Sin categorizar';
        const categoryColor = expense.categoryColor || '#cccccc';
        
        if (!categories[categoryId]) {
          categories[categoryId] = {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            total: 0,
            expenses: []
          };
        }
        
        categories[categoryId].total += expense.amount;
        categories[categoryId].expenses.push(expense);
      });
      
      // Convertir el objeto de categorías a array
      const categoriesArray = Object.values(categories);
      
      resolve({
        expenses,
        total,
        categories: categoriesArray
      });
    });
  });
}

// Crear gasto (categoría asignada automáticamente)
export function createExpense(data) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM rules", (err, rules) => {
      if (err) reject(err);

      let categoryId = data.categoryId ?? null;

      // Aplicar reglas automáticas
      if (!categoryId) {
        const match = rules.find(r =>
          data.description.toLowerCase().includes(r.containsText.toLowerCase())
        );
        if (match) categoryId = match.categoryId;
      }

      db.run(
        `INSERT INTO expenses (description, amount, date, categoryId)
         VALUES (?, ?, ?, ?)`,
        [data.description, data.amount, data.date, categoryId],
        function (err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            ...data,
            categoryId
          });
        }
      );
    });
  });
}

// NUEVA FUNCIÓN: eliminar gasto por ID
export function deleteExpense(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM expenses WHERE id = ?", [id], function(err) {
      if (err) reject(err);
      else resolve({ message: "Gasto eliminado correctamente" });
    });
  });
}

// Obtener el total de gastos
export function getTotalExpenses() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COALESCE(SUM(amount), 0) as total FROM expenses", [], (err, row) => {
      if (err) reject(err);
      else resolve(row ? Number(row.total) : 0);
    });
  });
}

