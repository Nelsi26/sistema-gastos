import axios from "axios";

// Instancia principal del backend
const api = axios.create({
  baseURL: "http://localhost:3000", // Cambia según tu backend
});

// GASTOS
export const getExpenses = () => api.get("/expenses");
export const createExpense = (data) => api.post("/expenses", data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// CATEGORÍAS
export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);

// REGLAS
export const getRules = () => api.get("/rules");
export const createRule = (data) => api.post("/rules", data);


