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


//Loader function for data
function loadTransaction(userEmail) {
  let data = JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
  
  //plain objects back to Transaction objects
  let transactions = data.map(obj => Transaction.fromJSON(obj));

  const tableBody = document.getElementById("transactionTable");
  tableBody.innerHTML = "";

  let income = 0, expense = 0;

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
    


  document.getElementById("incomeAmount").textContent = `$${income.toFixed(2)}`; 
  document.getElementById("expenseAmount").textContent = `$${expense.toFixed(2)}`; 
  document.getElementById("balanceAmount").textContent = `$${(income - expense).toFixed(2)}`; 

  //event listeners after render
  attachDeleteListeners(userEmail);
  attachEditListeners(userEmail);

}

// Logic for deleting transaction

function attachDeleteListeners(userEmail) {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      let index = btn.getAttribute("data-id");
      let transactions = JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
      transactions.splice(index, 1); //remove the transaction

      localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(transactions));

      //re-render
      loadTransaction(userEmail);
    })
  })
}

//logic for editing transaction

function attachEditListeners(userEmail) {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      let index = btn.getAttribute("data-id");

    let transactions = JSON.parse(localStorage.getItem(`transactions_${userEmail}`)) || [];
    let tx = transactions[index];

    //populate with existing vals
    document.getElementById("desc").value = tx.desc;
    document.getElementById("amount").value = tx.amount;
    document.getElementById("type").value = tx.type;
    document.getElementById("category").value = tx.category;
    document.getElementById("date").value = tx.date;

    document.getElementById("transactionForm").onsubmit = function(e) {
      e.preventDefault();

      tx.desc = document.getElementById("desc").value;
      tx.amount = parseFloat(document.getElementById("amount").value);
      tx.type = document.getElementById("type").value;
      tx.category = document.getElementById("category").value;
      tx.date = document.getElementById("date").value;

      transactions[index] = tx;
      localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(transactions));
      
      loadTransaction(userEmail);

      // Reset form & restore normal submit behavior
      document.getElementById("transactionForm").reset();
      document.getElementById("transactionForm").onsubmit = addTransactionHandler;
    };  
    });
  });
}

function addTransactionHandler(e) {
  e.preventDefault();

  const desc = document.getElementById("desc").value;
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const currentUser = getCookie("loggedInUser");

  const newTxn = new Transaction(desc, amount, type, category, date);

  let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];
  transactions.push(newTxn.toJSON());

  localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));

  loadTransaction(currentUser);
  document.getElementById("transactionForm").reset();
}

document.getElementById("transactionForm").onsubmit = addTransactionHandler;