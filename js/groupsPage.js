document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCookie("loggedInUser");

  if(!currentUser) {
    alert("Please login again.");
    window.location.href = "index.html";
    return;
  }

  let groups = JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
  groups = groups.map(g => Object.assign(new Group(), g));
  let currentGroup = null;

  //Rendering the group list
  function renderGroups() {
    const list = document.getElementById("groupList");
    list.innerHTML = "";
    groups.forEach((g, idx) => {
      const li = document.createElement("li");
      li.textContent = g.name;
      li.addEventListener("click", () => openGroup(idx));
      list.appendChild(li);
    });
    localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));
  }

  //Creating the group
  document.getElementById("createGroupBtn").addEventListener("click", () => {
    const name = document.getElementById("groupName").value;
    if (!name) {
      alert("Please enter a group name");
      return;
    }

    let newGroup = new Group(name);
    groups.push(newGroup);
    renderGroups();
    document.getElementById("groupName").value = "";
  });

  //Open group
  function openGroup(index) {
    currentGroup = groups[index];
    document.getElementById("currentGroupName").textContent = currentGroup.name;
    document.getElementById("groupDetails").style.display = "block";
    renderBalances();
  }

  //Adding a member
  document.getElementById("addMemberBtn").addEventListener("click", () => {
    let member = document.getElementById("memberName").value;
    if (!member) return;

    currentGroup.addMember(member);
    renderBalances();
    document.getElementById("memberName").value = "";
  });

  //Add expense
  document.getElementById("addExpenseBtn").addEventListener("click", () => {
    let desc = document.getElementById("expenseDesc").value;
    let amount = document.getElementById("expenseAmount").value;
    let paidBy = document.getElementById("expensePaidBy").value;

    try {
      currentGroup.addExpense(desc, amount, paidBy);
    } catch (e) {
      alert(e.message);
    }

    renderBalances();

    document.getElementById("expenseDesc").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expensePaidBy").value = "";
  });

  //Render balances
  function renderBalances() {
    const balances = currentGroup.calculateBalances();
    const list = document.getElementById("balanceList");
    list.innerHTML = "";
    balances.forEach((bal, member) => {
      const li = document.createElement("li");
      li.textContent = `${member}: ${bal >= 0 ? "gets back" : "owes"} ${Math.abs(bal)}`;
      list.appendChild(li);
    });
    localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));
  }

  renderGroups();

  //logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    deleteCookie("loggedInUser");
    window.location.href = "index.html";
  });
});