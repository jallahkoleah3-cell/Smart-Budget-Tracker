import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

/* ========================
   DOM
======================== */
const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const toggleDark = document.getElementById('toggleDark');

const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

const authContainer = document.getElementById("auth-container");
const app = document.getElementById("app");

/* ========================
   STATE
======================== */
let transactions = [];
let currentUser = null;
let chart = null;

/* ========================
   AUTH
======================== */
signupBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    authMessage.textContent = "Account created!";
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    authMessage.textContent = "Login successful!";
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

/* ========================
   AUTH STATE
======================== */
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authContainer.style.display = "none";
    app.style.display = "block";
    loadTransactions();
    loadDarkMode();
  } else {
    currentUser = null;
    authContainer.style.display = "flex";
    app.style.display = "none";
  }
});

/* ========================
   LOAD DATA
======================== */
function loadTransactions() {
  const userRef = ref(db, `users/${currentUser.uid}/transactions`);

  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    transactions = [];

    if (data) {
      transactions = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
        amount: Number(value.amount)
      }));
    }

    render();
  });
}

/* ========================
   ADD TRANSACTION
======================== */
function addTransaction(e) {
  e.preventDefault();

  if (!currentUser) return;
  if (!text.value || !amount.value || !category.value) return;

  const userRef = ref(db, `users/${currentUser.uid}/transactions`);

  push(userRef, {
    text: text.value,
    category: category.value,
    amount: Number(amount.value)
  });

  text.value = "";
  amount.value = "";
  category.value = "";
}

/* ========================
   REMOVE
======================== */
function removeTransaction(id) {
  const userRef = ref(db, `users/${currentUser.uid}/transactions/${id}`);
  remove(userRef);
}

window.removeTransaction = removeTransaction;

/* ========================
   RENDER
======================== */
function render() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

/* ========================
   DOM RENDER ITEM
======================== */
function addTransactionDOM(t) {
  const li = document.createElement("li");

  const sign = t.amount < 0 ? "-" : "+";
  li.classList.add(t.amount < 0 ? "expense" : "income");

  li.innerHTML = `
    <div>
      <strong>${t.category}</strong>
      <small>${t.text}</small>
    </div>

    <div>
      <span>${sign}$${Math.abs(t.amount)}</span>
      <button class="delete-btn" onclick="removeTransaction('${t.id}')">X</button>
    </div>
  `;

  list.appendChild(li);
}

/* ========================
   TOTALS
======================== */
function updateValues() {
  const amounts = transactions.map(t => t.amount);

  const total = amounts.reduce((a, b) => a + b, 0);
  const income = amounts.filter(x => x > 0).reduce((a, b) => a + b, 0);
  const expense = amounts.filter(x => x < 0).reduce((a, b) => a + b, 0);

  balance.textContent = `$${total.toFixed(2)}`;
  moneyPlus.textContent = `$${income.toFixed(2)}`;
  moneyMinus.textContent = `$${Math.abs(expense).toFixed(2)}`;

  drawChart(income, Math.abs(expense));
}

/* ========================
   CHART
======================== */
function drawChart(income, expense) {
  if (chart) chart.destroy();
  if (income === 0 && expense === 0) return;

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{ data: [income, expense] }]
    }
  });
}

/* ========================
   DARK MODE
======================== */
function loadDarkMode() {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    toggleDark.textContent = "☀";
  } else {
    toggleDark.textContent = "🌙";
  }
}

toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
  );

  toggleDark.textContent = document.body.classList.contains("dark-mode")
    ? "☀"
    : "🌙";
});

/* ========================
   EVENTS
======================== */
form.addEventListener("submit", addTransaction);