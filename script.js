import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  ref,
  set,
  push,
  onValue,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

/* =====================
   STATE
===================== */
let currentUser = null;
let transactions = [];
let chart = null;
let currentFilter = "all";

/* =====================
   DOM
===================== */
const authContainer = document.getElementById("auth-container");
const app = document.getElementById("app");

const email = document.getElementById("email");
const password = document.getElementById("password");

const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");

/* =====================
   AUTH BUTTONS (NO PAGE RELOAD FIX)
===================== */
document.getElementById("signupBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCred.user;

    await set(ref(db, `users/${user.uid}`), {
      profile: {
        email: user.email,
        createdAt: new Date().toISOString()
      },
      subscription: {
        plan: "free"
      }
    });

  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

/* =====================
   AUTH STATE
===================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    authContainer.style.display = "flex";
    app.style.display = "none";
    return;
  }

  currentUser = user;
  authContainer.style.display = "none";
  app.style.display = "block";

  const txRef = ref(db, `users/${user.uid}/transactions`);

  onValue(txRef, (snap) => {
    const data = snap.val();

    transactions = data
      ? Object.entries(data).map(([id, v]) => ({ id, ...v }))
      : [];

    render();
  });
});

/* =====================
   ADD TRANSACTION
===================== */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!text.value || !amount.value || !category.value) return;

  push(ref(db, `users/${currentUser.uid}/transactions`), {
    text: text.value,
    amount: Number(amount.value),
    category: category.value,
    date: new Date().toISOString()
  });

  form.reset();
});

/* =====================
   DELETE
===================== */
window.removeTransaction = (id) => {
  remove(ref(db, `users/${currentUser.uid}/transactions/${id}`));
};

/* =====================
   FILTER
===================== */
function getFilteredTransactions() {
  const now = new Date();

  return transactions.filter((t) => {
    const d = new Date(t.date);

    if (currentFilter === "daily") {
      return d.toDateString() === now.toDateString();
    }

    if (currentFilter === "weekly") {
      return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    }

    if (currentFilter === "monthly") {
      return d.getMonth() === now.getMonth();
    }

    return true;
  });
}

/* =====================
   RENDER
===================== */
function render() {
  list.innerHTML = "";

  const filtered = getFilteredTransactions();

  let total = 0;
  let income = 0;
  let expense = 0;

  filtered.forEach((t) => {
    const amt = Number(t.amount);

    total += amt;
    amt > 0 ? (income += amt) : (expense += amt);

    const li = document.createElement("li");
    li.classList.add(amt < 0 ? "expense" : "income");

    li.innerHTML = `
      <div>
        <strong>${t.category}</strong>
        <small>${t.text}</small>
      </div>
      <div>
        <span>${amt < 0 ? "-" : "+"}$${Math.abs(amt)}</span>
        <button onclick="removeTransaction('${t.id}')">X</button>
      </div>
    `;

    list.appendChild(li);
  });

  balance.textContent = `$${total.toFixed(2)}`;
  moneyPlus.textContent = `$${income.toFixed(2)}`;
  moneyMinus.textContent = `$${Math.abs(expense).toFixed(2)}`;

  drawChart(income, Math.abs(expense));
}

/* =====================
   CHART
===================== */
function drawChart(i, e) {
  const canvas = document.getElementById("expenseChart");

  if (chart) chart.destroy();

  if (i === 0 && e === 0) return;

  chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [i, e] }]
    }
  });
}

/* =====================
   FILTER BUTTONS
===================== */
document.getElementById("filterAll").onclick = () => {
  currentFilter = "all";
  render();
};

document.getElementById("filterDay").onclick = () => {
  currentFilter = "daily";
  render();
};

document.getElementById("filterWeek").onclick = () => {
  currentFilter = "weekly";
  render();
};

document.getElementById("filterMonth").onclick = () => {
  currentFilter = "monthly";
  render();
};