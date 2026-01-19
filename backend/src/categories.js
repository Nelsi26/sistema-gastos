import db from "./db.js";

// Categorías predeterminadas
const DEFAULT_CATEGORIES = [
  { name: 'Transporte', color: '#3498db' },
  { name: 'Comida', color: '#2ecc71' },
  { name: 'Compras', color: '#9b59b6' },
  { name: 'Entretenimiento', color: '#f1c40f' },
  { name: 'Servicios', color: '#e67e22' },
  { name: 'Salud', color: '#e74c3c' },
  { name: 'Otros', color: '#95a5a6' }
];

// Inicializar categorías predeterminadas si no existen
export async function initializeDefaultCategories() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM categories", [], async (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        console.log('Inicializando categorías predeterminadas...');
        try {
          for (const category of DEFAULT_CATEGORIES) {
            await createCategory(category);
          }
          console.log('Categorías predeterminadas inicializadas correctamente');
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        resolve();
      }
    });
  });
}

export function getAllCategories() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM categories", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function createCategory(data) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO categories (name, color) VALUES (?, ?)",
      [data.name, data.color],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      }
    );
  });
}
