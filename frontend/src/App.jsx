import { useEffect, useState } from "react";
import { getExpenses, createExpense, deleteExpense } from "./api";
import { saveAs } from 'file-saver';
import BalanceCard from "./components/BalanceCard";
import AddIncome from "./components/AddIncome";
import "./App.css";

// Componente para mostrar un ítem de ingreso
const IncomeItem = ({ income, onDelete }) => (
  <div className="income-item">
    <div>
      <span className="income-desc">{income.description}</span>
      <span className="income-date">
        {new Date(income.date).toLocaleDateString()}
      </span>
    </div>
    <div className="income-amount">
      ${income.amount.toFixed(2)}
      <button onClick={() => onDelete(income.id)} className="delete-btn">
        Eliminar
      </button>
    </div>
  </div>
);

// Componente para mostrar un ítem de gasto
const ExpenseItem = ({ expense, onDelete }) => (
  <div className="expense-item">
    <div>
      <span className="expense-desc">{expense.description}</span>
      <span className="expense-date">
        {new Date(expense.date).toLocaleDateString()}
      </span>
    </div>
    <div className="expense-amount">
      ${expense.amount.toFixed(2)}
      <button onClick={() => onDelete(expense.id)} className="delete-btn">
        Eliminar
      </button>
    </div>
  </div>
);

function App() {
  // Estados
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [balance, setBalance] = useState({ 
    totalIncome: 0, 
    totalExpenses: 0, 
    netBalance: 0 
  });
  const [form, setForm] = useState({ 
    description: "", 
    amount: "", 
    date: "" 
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Función para cargar todos los datos
  const fetchData = async () => {
    try {
      await Promise.all([fetchExpenses(), fetchIncomes(), fetchBalance()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  // Funciones de obtención de datos
  const fetchExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data.expenses || []);
  };

  const fetchIncomes = async () => {
    try {
      console.log('Fetching incomes...');
      const res = await fetch('http://localhost:3000/api/income');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Incomes data received:', data);
      // The API returns an array directly, not an object with an 'income' property
      setIncomes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    }
  };

  const fetchBalance = async () => {
    try {
      console.log('Fetching balance...');
      const res = await fetch('http://localhost:3000/api/balance');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Balance data received:', data);
      setBalance({
        totalIncome: Number(data.totalIncome) || 0,
        totalExpenses: Number(data.totalExpenses) || 0,
        netBalance: Number(data.balance) || 0
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Set default values in case of error
      setBalance({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0
      });
    }
  };

  // Manejadores de eventos
  const handleExportToExcel = async () => {
    try {
      const response = await fetch('http://localhost:3000/export/excel');
      const blob = await response.blob();
      saveAs(blob, `finanzas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Por favor, intente nuevamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpense(form);
      setForm({ description: "", amount: "", date: "" });
      await fetchData();
    } catch (error) {
      console.error('Error al agregar gasto:', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("¿Seguro quieres eliminar este gasto?")) {
      try {
        await deleteExpense(id);
        await fetchData();
      } catch (error) {
        console.error('Error al eliminar gasto:', error);
      }
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm("¿Seguro quieres eliminar este ingreso?")) {
      try {
        await fetch(`http://localhost:3000/api/income/${id}`, { method: 'DELETE' });
        await fetchData();
      } catch (error) {
        console.error('Error al eliminar ingreso:', error);
      }
    }
  };

  // Agrupar gastos por categoría
  const groupByCategory = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return {};
    return expenses.reduce((acc, expense) => {
      const categoryName = expense.categoryName || "Sin categorizar";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(expense);
      return acc;
    }, {});
  };

  const groupedExpenses = groupByCategory(expenses);

  // Renderizado
  return (
    <div className="app-container">
      <div className="left-column">
        <div className="balance-section">
          <BalanceCard 
            totalIncome={balance.totalIncome || 0}
            totalExpenses={balance.totalExpenses || 0}
            netBalance={balance.netBalance || 0}
          />
          <AddIncome onIncomeAdded={fetchData} />
        </div>
      </div>

      <div className="right-column">
        <div className="header-actions">
          <h2 className="section-title">Resumen Financiero</h2>
          <button onClick={handleExportToExcel} className="export-button">
            Exportar a Excel
          </button>
        </div>

        <div className="financial-summary">
          <div className="expense-form-section">
            <h3>Registrar Gasto</h3>
            <div className="card">
              <form className="form-box" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Descripción"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
                <button type="submit">Agregar gasto</button>
              </form>
            </div>
          </div>

          <div className="expenses-section">
            <h3>Gastos por Categoría</h3>
            {Object.keys(groupedExpenses).length > 0 ? (
              <div className="expenses-list">
                {Object.entries(groupedExpenses).map(([category, categoryExpenses]) => (
                  <div key={category} className="category-section">
                    <h4 className="category-title">{category}</h4>
                    {categoryExpenses.map(expense => (
                      <ExpenseItem 
                        key={expense.id} 
                        expense={expense} 
                        onDelete={handleDeleteExpense} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay gastos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


