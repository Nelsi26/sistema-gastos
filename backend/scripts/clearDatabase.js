import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database.db');

// Verificar si la base de datos existe
if (!fs.existsSync(dbPath)) {
  console.log('No se encontró la base de datos.');
  process.exit(0);
}

const db = new sqlite3.Database(dbPath);

// Obtener todas las tablas
const getTables = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      (err, tables) => {
        if (err) reject(err);
        else resolve(tables.map(t => t.name));
      }
    );
  });
};

// Vaciar una tabla
const clearTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ${tableName}`, function(err) {
      if (err) reject(err);
      else {
        console.log(`Tabla ${tableName} limpiada. Filas afectadas: ${this.changes}`);
        resolve();
      }
    });
  });
};

// Reiniciar el contador de autoincremento
const resetAutoincrement = (tableName) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const main = async () => {
  try {
    const tables = await getTables();
    
    if (tables.length === 0) {
      console.log('No se encontraron tablas en la base de datos.');
      return;
    }

    console.log('Tablas encontradas:', tables.join(', '));
    
    // Vaciar cada tabla
    for (const table of tables) {
      await clearTable(table);
      try {
        await resetAutoincrement(table);
      } catch (err) {
        // Ignorar errores de reinicio de autoincremento (puede no existir para tablas sin autoincrement)
      }
    }

    console.log('\n¡Base de datos limpiada exitosamente!');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    db.close();
  }
};

main();
