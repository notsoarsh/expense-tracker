document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCookie("loggedInUser");
  showLoader();
  if (!currentUser) {
    toast.error("Session expired, please login again.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  //display email
  document.getElementById("userEmail").textContent = `Welcome, ${currentUser}`;

  setTimeout(() => {
    loadTransaction(currentUser);
    hideLoader();
  }, 500);

  document.getElementById("logoutBtn").addEventListener("click", () => {
    showLoader();
    deleteCookie("loggedInUser");
    toast.success("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
});

let expenseChart; //gloabal reference for the charts

function renderExpenseChart(categories, amounts) {
  const ctx = document.getElementById("expensesChart").getContext("2d");

  //destroy the prev version
  if (expenseChart) {
    expenseChart.destroy();
  }

  const noData = amounts.length === 0;
  const labels = noData ? ["No expenses"] : categories;
  const data = noData ? [1] : amounts;
  const colors = noData
    ? ["#e5e7eb"]
    : ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Expenses by Category",
          data,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Expenses by Category" },
      },
    },
  });
}

//Monthly income vs expense
let barChart;
function renderMonthlyBarChart(months, incomeData, expenseData) {
  if (barChart) barChart.destroy();

  barChart = new Chart(document.getElementById("incomeExpenseChart"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Monthly Income vs Expenses" },
      },
    },
  });
}

//Loader function for data
function loadTransaction(userEmail) {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
  } catch (e) {
    console.error("Failed to parse transactions:", e);
    data = [];
  }

  //plain objects back to Transaction objects
  let transactions = data.map((obj) => Transaction.fromJSON(obj));

  const tableBody = document.getElementById("transactionTable");
  tableBody.innerHTML = "";

  let income = 0,
    expense = 0;

  transactions.forEach((tx, index) => {
    if (tx.type === "Income") income += tx.amount;
    else expense += tx.amount;

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.desc}</td>
      <td>${tx.amount.toFixed(2)}</td>
      <td>${tx.category}</td>
      <td>${tx.date}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-btn" data-id="${index}">✏️</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${index}">❌</button>
      </td>  
    `;
    tableBody.appendChild(row);
  });
  // Category totals using a map
  let categoryTotals = new Map();
  //we store the amount per category
  transactions.forEach((tx) => {
    if (tx.type == "Expense") {
      let prev = categoryTotals.get(tx.category) || 0;
      categoryTotals.set(tx.category, prev + tx.amount);
    }
  });

  let categories = [...categoryTotals.keys()]; //charts understand only arrays
  let amounts = [...categoryTotals.values()];

  //monthly expense vs income
  let monthlyTotals = new Map();
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (!monthlyTotals.has(key)) {
      monthlyTotals.set(key, {
        income: 0,
        expense: 0,
        date: new Date(d.getFullYear(), d.getMonth(), 1),
      });
    }
    const cur = monthlyTotals.get(key);
    if (tx.type === "Income") cur.income += tx.amount;
    else cur.expense += tx.amount;
  });
  const sorted = [...monthlyTotals.entries()].sort(
    (a, b) => a[1].date - b[1].date
  );
  const months = sorted.map(([_, v]) =>
    v.date.toLocaleString("default", { month: "short", year: "2-digit" })
  );
  const incomeData = sorted.map(([_, v]) => v.income);
  const expenseData = sorted.map(([_, v]) => v.expense);

  document.getElementById("incomeAmount").textContent = `$${income.toFixed(2)}`;
  document.getElementById("expenseAmount").textContent = `$${expense.toFixed(
    2
  )}`;
  document.getElementById("balanceAmount").textContent = `$${(
    income - expense
  ).toFixed(2)}`;

  //event listeners after render
  attachDeleteListeners(userEmail);
  attachEditListeners(userEmail);
  renderExpenseChart(categories, amounts);
  renderMonthlyBarChart(months, incomeData, expenseData);
}

// Logic for deleting transaction

function attachDeleteListeners(userEmail) {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let index = btn.getAttribute("data-id");
      toast.confirm("Are you sure you want to delete this transaction?", () => {
        let transactions =
          JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
        transactions.splice(index, 1);
        localStorage.setItem(
          `transactions_${userEmail}`,
          JSON.stringify(transactions)
        );
        loadTransaction(userEmail);
        toast.success("Transaction deleted successfully!");
      });
    });
  });
}

//logic for editing transaction

function attachEditListeners(userEmail) {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let index = btn.getAttribute("data-id");

      let transactions =
        JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
      let tx = transactions[index];

      //populate with existing vals
      document.getElementById("desc").value = tx.desc;
      document.getElementById("amount").value = tx.amount;
      document.getElementById("type").value = tx.type;
      document.getElementById("category").value = tx.category;
      document.getElementById("date").value = tx.date;

      document.getElementById("transactionForm").onsubmit = function (e) {
        e.preventDefault();

        tx.desc = document.getElementById("desc").value;
        tx.amount = parseFloat(document.getElementById("amount").value);
        tx.type = document.getElementById("type").value;
        tx.category = document.getElementById("category").value;
        tx.date = document.getElementById("date").value;
        // console.log({ desc, amount, type, category, date });
        transactions[index] = tx;
        localStorage.setItem(
          `transactions_${userEmail}`,
          JSON.stringify(transactions)
        );

        loadTransaction(userEmail);

        // Reset form & restore normal submit behavior
        document.getElementById("transactionForm").reset();
        document.getElementById("transactionForm").onsubmit =
          addTransactionHandler;
      };
    });
  });
}

function addTransactionHandler(e) {
  e.preventDefault();
  showLoader();
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  //Validation
  if (!desc) {
    hideLoader();
    toast.error("Description is required!");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    hideLoader();
    toast.error("Please enter a valid positive amount!");
    return;
  }
  if (!category) {
    hideLoader();
    toast.error("Category is required");
    return;
  }
  if (!date) {
    hideLoader();
    toast.error("Please select a date!");
    return;
  }

  const currentUser = getCookie("loggedInUser");

  const newTxn = new Transaction(desc, amount, type, category, date);

  let transactions =
    JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];
  transactions.push(newTxn.toJSON());

  localStorage.setItem(
    `transactions_${currentUser}`,
    JSON.stringify(transactions)
  );

  loadTransaction(currentUser);
  document.getElementById("transactionForm").reset();

  setTimeout(() => {
    hideLoader();
    toast.success("Transaction added successfully!");
  }, 300);
}

document.getElementById("transactionForm").onsubmit = addTransactionHandler;
