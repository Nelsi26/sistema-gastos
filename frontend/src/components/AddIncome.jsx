import { useState } from 'react';
import axios from 'axios';

function AddIncome({ onIncomeAdded }) {
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Ingreso' // Default description
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/income', formData);
      setFormData({ 
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: 'Ingreso' // Reset to default
      });
      onIncomeAdded();
    } catch (error) {
      console.error('Error al agregar ingreso:', error);
    }
  };

  return (
    <div className="card">
      <h3>Agregar Ingreso</h3>
      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="number"
          placeholder="Monto"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
          step="0.01"
          min="0"
          required
          className="amount-input"
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
          className="date-input"
        />
        <button type="submit" className="add-button">+</button>
      </form>
    </div>
  );
}

export default AddIncome;
