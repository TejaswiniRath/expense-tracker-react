import { useState, useEffect } from "react";
import "./ExpenseForm.css";

function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState(() => {
  const savedExpenses = localStorage.getItem("expenses");

  if (savedExpenses) {
    return JSON.parse(savedExpenses);
  }

  return [];
});

  function handleAddExpense() {
    const newExpense = {
      amount,
      category,
      description,
      date,
    };

    setExpenses([...expenses, newExpense]);

    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
  }

  function handleDeleteExpense(indexToDelete) {
    const updatedExpenses = expenses.filter((expense, index) => {
      return index !== indexToDelete;
    });

    setExpenses(updatedExpenses);
  }
  useEffect(() => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}, [expenses]);

  const totalExpense = expenses.reduce((total, expense) => {
  return total + Number(expense.amount);
}, 0);

  return (
    <div className="container">
      <h2>Expense Tracker</h2>

      <div>
        <label>Amount</label>
        <br />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Category</label>
        <br />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
        </select>
      </div>

      <br />

      <div>
        <label>Description</label>
        <br />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Date</label>
        <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <br />

      <button onClick={handleAddExpense}>
        Add Expense
      </button>

      <hr />
      <h3>Total Expense: ₹{totalExpense}</h3>
      <h3>Expenses</h3>

      {expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        expenses.map((expense, index) => (
          <div key={index} className="expense-card">
            <p><strong>Amount:</strong> ₹{expense.amount}</p>
            <p><strong>Category:</strong> {expense.category}</p>
            <p><strong>Description:</strong> {expense.description}</p>
            <p><strong>Date:</strong> {expense.date}</p>

            <button onClick={() => handleDeleteExpense(index)}>
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default ExpenseForm;