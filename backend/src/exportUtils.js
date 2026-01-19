import * as XLSX from 'xlsx';
import { getAllExpenses, getTotalExpenses } from './expenses.js';
import { getAllIncome, getTotalIncome } from './income.js';

export async function exportToExcel() {
  try {
    // Obtener todos los datos necesarios
    const [
      { expenses, total: totalExpenses, categories: expenseCategories },
      incomes,
      totalIncome
    ] = await Promise.all([
      getAllExpenses(),
      getAllIncome(),
      getTotalIncome()
    ]);
    
    const balance = totalIncome - totalExpenses;

    // 1. Hoja de Resumen General
    const summaryData = [
      { 'Concepto': 'INGRESOS', 'Monto': '' },
      { 'Concepto': 'Total Ingresos', 'Monto': totalIncome },
      { 'Concepto': '', 'Monto': '' },
      { 'Concepto': 'GASTOS', 'Monto': '' },
      ...expenseCategories.map(cat => ({
        'Concepto': `- ${cat.name}`,
        'Monto': cat.total
      })),
      { 'Concepto': 'Total Gastos', 'Monto': totalExpenses },
      { 'Concepto': '', 'Monto': '' },
      { 'Concepto': 'BALANCE FINAL', 'Monto': balance }
    ];

    // 2. Hoja de Gastos Detallados
    const expensesData = expenses.map(expense => ({
      'ID': expense.id,
      'Fecha': expense.date,
      'Descripción': expense.description,
      'Categoría': expense.categoryName || 'Sin categorizar',
      'Monto': expense.amount,
      'Notas': expense.notes || ''
    }));

    // 3. Hoja de Ingresos Detallados
    const incomesData = incomes.map(income => ({
      'ID': income.id,
      'Fecha': income.date,
      'Descripción': income.description,
      'Monto': income.amount,
      'Notas': income.notes || ''
    }));

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Agregar hojas
    addSheetWithStyle(wb, 'Resumen', summaryData, [
      { wch: 30 }, { wch: 20 }
    ], { headerStyle: { font: { bold: true } } });

    addSheetWithStyle(wb, 'Gastos', expensesData, [
      { wch: 8 },   // ID
      { wch: 15 },  // Fecha
      { wch: 40 },  // Descripción
      { wch: 25 },  // Categoría
      { wch: 15 },  // Monto
      { wch: 50 }   // Notas
    ], { 
      moneyColumns: [4],  // Índice de la columna de Monto
      dateColumns: [1]    // Índice de la columna de Fecha
    });

    addSheetWithStyle(wb, 'Ingresos', incomesData, [
      { wch: 8 },   // ID
      { wch: 15 },  // Fecha
      { wch: 40 },  // Descripción
      { wch: 15 },  // Monto
      { wch: 50 }   // Notas
    ], {
      moneyColumns: [3],  // Índice de la columna de Monto
      dateColumns: [1]    // Índice de la columna de Fecha
    });

    // Generar archivo Excel
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
    throw error;
  }
}

// Función auxiliar para agregar hojas con estilos
function addSheetWithStyle(wb, sheetName, data, cols, options = {}) {
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  if (cols) {
    ws['!cols'] = cols;
  }

  // Aplicar formato de moneda
  if (options.moneyColumns) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    options.moneyColumns.forEach(col => {
      for (let R = 1; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: col })];
        if (cell) {
          cell.t = 'n';
          cell.z = '#,##0.00';
        }
      }
    });
  }

  // Aplicar formato de fecha
  if (options.dateColumns) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    options.dateColumns.forEach(col => {
      for (let R = 1; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: col })];
        if (cell) {
          cell.z = 'dd/mm/yyyy';
        }
      }
    });
  }

  // Aplicar estilos al encabezado
  if (options.headerStyle) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = options.headerStyle;
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}