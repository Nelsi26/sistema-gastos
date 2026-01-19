import db from "./db.js";

const DEFAULT_RULES = [
  // Transporte
  { containsText: 'uber', categoryId: 1 },
  { containsText: 'taxi', categoryId: 1 },
  { containsText: 'metro', categoryId: 1 },
  { containsText: 'bus', categoryId: 1 },
  { containsText: 'transporte', categoryId: 1 },
  { containsText: 'gasolina', categoryId: 1 },
  
  // Comida
  { containsText: 'restaurante', categoryId: 2 },
  { containsText: 'comida', categoryId: 2 },
  { containsText: 'almuerzo', categoryId: 2 },
  { containsText: 'cena', categoryId: 2 },
  { containsText: 'desayuno', categoryId: 2 },
  { containsText: 'mcdonald', categoryId: 2 },
  { containsText: 'hamburguesa', categoryId: 2 },
  { containsText: 'pizza', categoryId: 2 },
  
  // Compras
  { containsText: 'ropa', categoryId: 3 },
  { containsText: 'zapato', categoryId: 3 },
  { containsText: 'tienda', categoryId: 3 },
  { containsText: 'compra', categoryId: 3 },
  { containsText: 'mercado', categoryId: 3 },
  { containsText: 'supermercado', categoryId: 3 },
  
  // Entretenimiento
  { containsText: 'cine', categoryId: 4 },
  { containsText: 'película', categoryId: 4 },
  { containsText: 'netflix', categoryId: 4 },
  { containsText: 'spotify', categoryId: 4 },
  { containsText: 'juego', categoryId: 4 },
  
  // Servicios
  { containsText: 'luz', categoryId: 5 },
  { containsText: 'agua', categoryId: 5 },
  { containsText: 'gas', categoryId: 5 },
  { containsText: 'teléfono', categoryId: 5 },
  { containsText: 'internet', categoryId: 5 },
  { containsText: 'netflix', categoryId: 5 },
  { containsText: 'spotify', categoryId: 5 },
  { containsText: 'suscripción', categoryId: 5 },
  
  // Salud
  { containsText: 'farmacia', categoryId: 6 },
  { containsText: 'médico', categoryId: 6 },
  { containsText: 'hospital', categoryId: 6 },
  { containsText: 'fisioterapeuta', categoryId: 6 },
  { containsText: 'óptica', categoryId: 6 },
  { containsText: 'lentes', categoryId: 6 }
];

// Inicializar reglas predeterminadas si no existen
export async function initializeDefaultRules() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM rules", [], async (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        console.log('Inicializando reglas predeterminadas...');
        try {
          for (const rule of DEFAULT_RULES) {
            await createRule(rule);
          }
          console.log('Reglas predeterminadas inicializadas correctamente');
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

export function getAllRules() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM rules", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function createRule(data) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO rules (containsText, categoryId) VALUES (?, ?)",
      [data.containsText, data.categoryId],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      }
    );
  });
}
