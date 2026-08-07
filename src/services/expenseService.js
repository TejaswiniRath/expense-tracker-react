import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const expenseCollection = collection(db, "expenses");

// Add Expense
export async function addExpense(expense) {
  await addDoc(expenseCollection, expense);
}

// Get Expenses of Logged-in User
export async function getExpenses(uid) {
  const q = query(expenseCollection, where("uid", "==", uid));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Update Expense
export async function updateExpense(id, updatedExpense) {
  const expenseDoc = doc(db, "expenses", id);

  await updateDoc(expenseDoc, updatedExpense);
}

// Delete Expense
export async function deleteExpense(id) {
  const expenseDoc = doc(db, "expenses", id);

  await deleteDoc(expenseDoc);
}