import {
  getExpenses,
  addExpense as addExpenseToFirestore,
} from "../services/expenseService";

import { auth } from "../firebase/firebase";
import { useState, useEffect } from "react";
import "./ExpenseForm.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { analyzeExpenses } from "../services/aiService";
import ReactMarkdown from "react-markdown";



function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [error, setError] = useState("");
  const [budget, setBudget] = useState(
  () => Number(localStorage.getItem("budget")) || 0
);
const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("theme") === "dark";
});
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [income, setIncome] = useState(
  () => Number(localStorage.getItem("income")) || 0
);

  const [expenses, setExpenses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  async function handleAddExpense() {
    console.log("Button clicked");
    if (amount === "") {
      setError("Please enter an amount.");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (category === "") {
      setError("Please select a category.");
      return;
    }

    if (description.trim() === "") {
      setError("Please enter a description.");
      return;
    }

    if (date === "") {
      setError("Please select a date.");
      return;
    }

    setError("");

    const newExpense = {
  amount,
  category,
  description,
  date,
  uid: auth.currentUser.uid,
};
    if (editingIndex === null) {
      console.log(newExpense);
  await addExpenseToFirestore(newExpense);
  console.log("Saved to Firestore");

const updatedExpenses = await getExpenses(auth.currentUser.uid);
  setExpenses(updatedExpenses);

  toast.success("Expense added successfully!");
}
     else {
  const updatedExpenses = [...expenses];
  updatedExpenses[editingIndex] = newExpense;
  setExpenses(updatedExpenses);
  setEditingIndex(null);

  toast.info("Expense updated successfully!");
}

    handleClearForm();
  }
  const [aiResponse, setAiResponse] = useState("");
const [loadingAI, setLoadingAI] = useState(false);

  function handleEditExpense(indexToEdit) {
    const expenseToEdit = expenses[indexToEdit];

    setAmount(expenseToEdit.amount);
    setCategory(expenseToEdit.category);
    setDescription(expenseToEdit.description);
    setDate(expenseToEdit.date);

    setEditingIndex(indexToEdit);
    setError("");
  }

  function handleDeleteExpense(indexToDelete) {
    const updatedExpenses = expenses.filter((expense, index) => {
      return index !== indexToDelete;
    });

    setExpenses(updatedExpenses);
    toast.error("Expense deleted successfully!");
    if (editingIndex === indexToDelete) {
      handleClearForm();
    }
  }

  function handleClearForm() {
    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
    setEditingIndex(null);
    setError("");
  }

  function handleExportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Report", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Amount", "Category", "Description", "Date"]],
    body: expenses.map((expense) => [
      `₹${expense.amount}`,
      expense.category,
      expense.description,
      expense.date,
    ]),
  });

  doc.text(
    `Total Expense: ₹${totalExpense.toLocaleString("en-IN")}`,
    14,
    doc.lastAutoTable.finalY + 15
  );

  doc.save("Expense_Report.pdf");
}
function handleExportCSV() {
  const headers = ["Amount", "Category", "Description", "Date"];

  const rows = expenses.map((expense) => [
    expense.amount,
    expense.category,
    expense.description,
    expense.date,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Expense_Report.csv";
  link.click();

  URL.revokeObjectURL(url);
}
async function handleAnalyzeExpenses() {
  setLoadingAI(true);

  try {
    console.log(import.meta.env.VITE_GEMINI_API_KEY);

    const result = await analyzeExpenses(expenses);

    console.log(result);

    setAiResponse(result);
  } catch (error) {
    console.error("AI ERROR:", error);

    alert(error.message || JSON.stringify(error));
  }

  setLoadingAI(false);
}

useEffect(() => {
  localStorage.setItem("budget", budget);
}, [budget]);
useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);
useEffect(() => {
  localStorage.setItem("income", income);
}, [income]);
useEffect(() => {
  async function fetchExpenses() {
    try {
    const data = await getExpenses(auth.currentUser.uid);
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }

  fetchExpenses();
}, []);

  const totalExpense = expenses.reduce((total, expense) => {
    return total + Number(expense.amount);
  }, 0);

  const remainingBudget = budget - totalExpense;
const budgetUsed =
  budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;

  const totalTransactions = expenses.length;

const highestExpense =
  expenses.length > 0
    ? Math.max(...expenses.map((expense) => Number(expense.amount)))
    : 0;

const lowestExpense =
  expenses.length > 0
    ? Math.min(...expenses.map((expense) => Number(expense.amount)))
    : 0;
const savings = income - totalExpense;

const savingsRate =
  income > 0 ? ((savings / income) * 100).toFixed(1) : 0; 

const filteredExpenses = expenses.filter((expense) => {
  const matchesSearch =
    expense.description.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    expense.category === selectedCategory;

  const matchesDate =
    (!startDate || expense.date >= startDate) &&
    (!endDate || expense.date <= endDate);

  return matchesSearch && matchesCategory && matchesDate;
});

const sortedExpenses = [...filteredExpenses];

if (sortOption === "highest") {
  sortedExpenses.sort((a, b) => Number(b.amount) - Number(a.amount));
} else if (sortOption === "lowest") {
  sortedExpenses.sort((a, b) => Number(a.amount) - Number(b.amount));
} else if (sortOption === "newest") {
  sortedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
} else if (sortOption === "oldest") {
  sortedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
}


  const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444"];
  const chartData = ["Food", "Travel", "Shopping", "Bills"].map((cat) => {
  return {
    name: cat,
    value: expenses
      .filter((expense) => expense.category === cat)
      .reduce((sum, expense) => sum + Number(expense.amount), 0),
  };
});
const monthlyData = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((month, index) => {
  return {
    month,
    amount: expenses
      .filter(
        (expense) => new Date(expense.date).getMonth() === index
      )
      .reduce((sum, expense) => sum + Number(expense.amount), 0),
  };
});

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}> 
     <div className="header">
  <h2>Expense Tracker</h2>

  <button
    className="theme-btn"
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
  </button>
</div> 

    <div className="income-section">
  <h3>Monthly Income</h3>

  <input
    type="number"
    placeholder="Enter your monthly income"
    value={income}
    onChange={(e) => setIncome(Number(e.target.value))}
  />
</div>

      <div className="budget-section">
  <label>Monthly Budget</label>
  <br />
  <input
    type="number"
    placeholder="Enter Budget"
    value={budget}
    onChange={(e) => setBudget(Number(e.target.value))}
  />

  <p>
    <strong>Budget:</strong> ₹{budget.toLocaleString("en-IN")}
  </p>

  <p>
    <strong>Remaining:</strong>{" "}
    <span style={{ color: remainingBudget >= 0 ? "green" : "red" }}>
      ₹{remainingBudget.toLocaleString("en-IN")}
    </span>
  </p>
</div>

<div className="progress-bar">
  <div
    className="progress-fill"
    style={{ width: `${budgetUsed}%` }}
  ></div>
</div>

<p>{budgetUsed.toFixed(1)}% of budget used</p>
{remainingBudget < 0 && (
  <p className="error">
    ⚠️ You have exceeded your monthly budget!
  </p>
)}


<div className="dashboard">
  <div className="card">
    <h4>💰 Total Expense</h4>
    <h2>₹{totalExpense.toLocaleString("en-IN")}</h2>
  </div>
  <button
  className="ai-btn"
  onClick={handleAnalyzeExpenses}
  disabled={loadingAI}
>
  {loadingAI ? "🤖 Analyzing Your Expenses..." : "✨ Analyze My Spending"}
</button>
{aiResponse && (
  <div className="ai-card">
    <div className="ai-header">
      🤖 AI Financial Advisor
    </div>

    <div className="ai-body">
      <pre>{aiResponse}</pre>
    </div>
  </div>
)}

  <div className="card">
    <h4>🧾 Transactions</h4>
    <h2>{totalTransactions}</h2>
  </div>

  <div className="card">
    <h4>📈 Highest</h4>
    <h2>₹{highestExpense.toLocaleString("en-IN")}</h2>
  </div>

  <div className="card">
    <h4>📉 Lowest</h4>
    <h2>₹{lowestExpense.toLocaleString("en-IN")}</h2>
  </div>
 
  <div className="card">
    <h4>💵 Income</h4>
    <h2>₹{income.toLocaleString("en-IN")}</h2>
  </div>

  <div className="card">
    <h4>🏦 Savings</h4>
    <h2 style={{ color: savings >= 0 ? "green" : "red" }}>
      ₹{savings.toLocaleString("en-IN")}
    </h2>
  </div>

  
  <div className="card">
    <h4>📊 Savings Rate</h4>
    <h2>{savingsRate}%</h2>
  </div>
</div>

<h3>Expenses by Category</h3>

<div className="chart-container">
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
        label
      >
        {chartData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

<h3>Monthly Expenses</h3>

<div className="chart-container">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar
        dataKey="amount"
        fill="#2563eb"
        name="Expense (₹)"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

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

      <div className="button-group">
        <button onClick={handleAddExpense}>
          {editingIndex === null ? "Add Expense" : "Update Expense"}
        </button>

        <button onClick={handleClearForm}>
          Clear Form
        </button>
       <button onClick={handleExportPDF}>
       📄 Export PDF
       </button>
       <button onClick={handleExportCSV}>
  📊 Export CSV
</button>
      </div>

      {error && <p className="error">{error}</p>}

      <hr />

      <div>
        <label>Search Expense</label>
        <br />
        <input
          type="text"
          placeholder="Search by description or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Filter by Category</label>
        <br />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
        </select>
      </div>

      <br />

      <div>
        <label>Sort By</label>
        <br />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
          <option value="newest">Newest Date</option>
          <option value="oldest">Oldest Date</option>
        </select>
      </div>
      <div className="date-filter">
  <div>
    <label>From:</label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  <div>
    <label>To:</label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
</div>

      <br />

      

      <h3>Expenses</h3>

      {sortedExpenses.length === 0 ? (
        <p>No matching expenses found.</p>
      ) : (
        sortedExpenses.map((expense, index) => (
          <div key={index} className="expense-card">
            <p>
              <strong>Amount:</strong> ₹
              {Number(expense.amount).toLocaleString("en-IN")}
            </p>

            <p>
              <strong>Category:</strong> {expense.category}
            </p>

            <p>
              <strong>Description:</strong> {expense.description}
            </p>

            <p>
              <strong>Date:</strong> {expense.date}
            </p>

            <button onClick={() => handleEditExpense(index)}>
              Edit
            </button>

            <button onClick={() => handleDeleteExpense(index)}>
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
      <ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
/>
    </div>
  );
}

export default ExpenseForm; 