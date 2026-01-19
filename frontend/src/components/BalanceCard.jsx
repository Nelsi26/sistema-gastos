import React from 'react';
import PropTypes from 'prop-types';

function BalanceCard({ totalIncome, totalExpenses, netBalance: balance }) {
  console.log('BalanceCard props:', { totalIncome, totalExpenses, balance });
  return (
    <div className="balance-card">
      <div className="balance-section">
        <div>Ingresos</div>
        <div className="balance-amount income-amount">
          ${totalIncome.toFixed(2)}
        </div>
      </div>
      
      <div className="balance-section">
        <div>Gastos</div>
        <div className="balance-amount expense-amount">
          ${totalExpenses.toFixed(2)}
        </div>
      </div>
      
      <div className="balance-section">
        <div>Balance</div>
        <div className={`balance-total ${balance >= 0 ? 'income-amount' : 'expense-amount'}`}>
          ${Math.abs(balance).toFixed(2)} {balance >= 0 ? '😊' : '😟'}
        </div>
      </div>
    </div>
  );
}

BalanceCard.propTypes = {
  totalIncome: PropTypes.number.isRequired,
  totalExpenses: PropTypes.number.isRequired,
  balance: PropTypes.number.isRequired
};

export default BalanceCard;
