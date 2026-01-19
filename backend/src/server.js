import express from "express";
import cors from "cors";
import { getAllExpenses, createExpense, deleteExpense, getTotalExpenses } from "./expenses.js";
import { exportToExcel } from "./exportUtils.js";
import { getAllCategories, createCategory, initializeDefaultCategories } from "./categories.js";
import { getAllRules, createRule, initializeDefaultRules } from "./rules.js";
import { 
  getAllIncome, 
  addIncome, 
  updateIncome, 
  deleteIncome, 
  getTotalIncome 
} from "./income.js";

const app = express();

// Middleware
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"] }));
app.use(express.json());

// RUTA RAÍZ
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🚀");
});

// Rutas públicas

// EXPENSES
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/expenses", async (req, res) => {
  try {
    const expense = await createExpense(req.body);
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const result = await deleteExpense(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CATEGORIES
app.get("/categories", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/categories", async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RULES
app.get("/rules", async (req, res) => {
  try {
    const rules = await getAllRules();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/rules", async (req, res) => {
  try {
    const rule = await createRule(req.body);
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Exportar a Excel
app.get("/export/excel", async (req, res) => {
  try {
    const excelBuffer = await exportToExcel();
    
    // Configurar los headers para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=gastos.xlsx');
    
    // Enviar el archivo
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    res.status(500).json({ error: "Error al generar el archivo Excel" });
  }
});

// RUTAS DE INGRESOS
app.get('/api/income', async (req, res) => {
  try {
    const income = await getAllIncome();
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const newIncome = await addIncome(req.body);
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/income/:id', async (req, res) => {
  try {
    const updatedIncome = await updateIncome(req.params.id, req.body);
    res.json(updatedIncome);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  try {
    await deleteIncome(req.params.id);
    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RUTA DE BALANCE
app.get('/api/balance', async (req, res) => {
  try {
    const [totalIncome, totalExpenses] = await Promise.all([
      getTotalIncome(),
      getTotalExpenses()
    ]);
    const balance = totalIncome - totalExpenses;
    
    res.json({
      totalIncome,
      totalExpenses,
      balance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FALLBACK: cualquier otra ruta
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// Inicializar categorías y reglas predeterminadas
async function initializeApp() {
  try {
    await initializeDefaultCategories();
    await initializeDefaultRules();
    console.log('Aplicación inicializada con categorías y reglas predeterminadas');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
}

// INICIAR SERVIDOR
app.listen(3000, async () => {
  console.log("Servidor escuchando en http://localhost:3000");
  await initializeApp();
});
