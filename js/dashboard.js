document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCookie("loggedInUser");

  if (!currentUser) {
    alert("Session expired, please login again.");
    window.location.href = "index.html";
    return;
  }

  //display email
  document.getElementById("userEmail").textContent = `Welcome, ${currentUser}`;

  loadTransaction(currentUser);

  document.getElementById("logoutBtn").addEventListener("click", () =>{
    deleteCookie("loggedInUser");
    alert("Logged out successfully.");
    window.location.href = "index.html";
  });
});

document.getElementById("transactionForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = document.getElementById("desc").value;
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const currentUser = getCookie("loggedInUser");

  //create new transaction
  const newTransaction = new Transaction(desc, amount, type, category, date);

  //get old transactions
  let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];
  //add the new transaction
  transactions.push(newTransaction.toJSON());
  localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));

  //re-render
  loadTransaction(currentUser);

  document.getElementById("transactionForm").reset();
});


//Loader function for data
function loadTransaction(userEmail) {
  let data = JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
  
  //plain objects back to Transaction objects
  let transactions = data.map(obj => Transaction.fromJSON(obj));

  const tableBody = document.getElementById("transactionTable");
  tableBody.innerHTML = "";

  let income = 0, expense = 0;

  for (let tx of transactions) {
    if (tx.type === "Income") income += tx.amount;
    else expense += tx.amount;

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.desc}</td>
      <td>${tx.amount.toFixed(2)}</td>
      <td>${tx.category}</td>
      <td>${tx.date}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-btn">✏️</button>
        <button class="btn btn-sm btn-danger delete-btn">❌</button>
      </td>  
    `;
    tableBody.appendChild(row);
  }

  document.getElementById("incomeAmount").textContent = `$${income.toFixed(2)}`; 
  document.getElementById("expenseAmount").textContent = `$${expense.toFixed(2)}`; 
  document.getElementById("balanceAmount").textContent = `$${(income - expense).toFixed(2)}`; 

}
