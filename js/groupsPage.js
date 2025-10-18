// document.addEventListener("DOMContentLoaded", () => {
//   const currentUser = getCookie("loggedInUser");
//   showLoader();
//   if(!currentUser) {
//     alert("Please login again.");
//     window.location.href = "index.html";
//     return;
//   }

//   let groups = JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
//   groups = groups.map(g => Object.assign(new Group(), g));
//   let currentGroup = null;

//   //Rendering the group list
//   function renderGroups() {
//     const list = document.getElementById("groupList");
//     list.innerHTML = "";
//     groups.forEach((g, idx) => {
//       const li = document.createElement("li");
//       li.textContent = g.name;
//       li.addEventListener("click", () => openGroup(idx));
//       list.appendChild(li);
//     });
//     localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));
//   }

//   //Creating the group
//   document.getElementById("createGroupBtn").addEventListener("click", () => {
//     const name = document.getElementById("groupName").value;
//     if (!name) {
//       alert("Please enter a group name");
//       return;
//     }

//     let newGroup = new Group(name);
//     groups.push(newGroup);
//     renderGroups();
//     document.getElementById("groupName").value = "";
//   });

//   //Open group
//   function openGroup(index) {
//     currentGroup = groups[index];
//     document.getElementById("currentGroupName").textContent = currentGroup.name;
//     document.getElementById("groupDetails").style.display = "block";
//     renderBalances();
//   }

//   //Adding a member
//   document.getElementById("addMemberBtn").addEventListener("click", () => {
//     let member = document.getElementById("memberName").value;
//     if (!member) return;

//     currentGroup.addMember(member);
//     renderBalances();
//     document.getElementById("memberName").value = "";
//   });

//   //Add expense
//   document.getElementById("addExpenseBtn").addEventListener("click", () => {
//     let desc = document.getElementById("expenseDesc").value;
//     let amount = document.getElementById("expenseAmount").value;
//     let paidBy = document.getElementById("expensePaidBy").value;

//     try {
//       currentGroup.addExpense(desc, amount, paidBy);
//     } catch (e) {
//       alert(e.message);
//     }

//     renderBalances();

//     document.getElementById("expenseDesc").value = "";
//     document.getElementById("expenseAmount").value = "";
//     document.getElementById("expensePaidBy").value = "";
//   });

//   //Render balances
//   function renderBalances() {
//     const balances = currentGroup.calculateBalances();
//     const list = document.getElementById("balanceList");
//     list.innerHTML = "";
//     balances.forEach((bal, member) => {
//       const li = document.createElement("li");
//       li.textContent = `${member}: ${bal >= 0 ? "gets back" : "owes"} ${Math.abs(bal)}`;
//       list.appendChild(li);
//     });
//     localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));
//   }

//   renderGroups();

//   //logout
//   document.getElementById("logoutBtn").addEventListener("click", () => {
//     deleteCookie("loggedInUser");
//     window.location.href = "index.html";
//   });
// });

// Fallbacks so loader always works even if loader.js isn't loaded
function showLoader() {
  const el = document.getElementById("app-loader");
  if (el) el.style.display = "flex";
}
function hideLoader() {
  const el = document.getElementById("app-loader");
  if (el) el.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  showLoader();
  try {
    if (typeof getCookie !== "function") throw new Error("utils.js not loaded");
    if (typeof Group === "undefined") throw new Error("groups.js not loaded");

    const currentUser = getCookie("loggedInUser");
    if (!currentUser) {
      alert("Please login again.");
      window.location.href = "index.html";
      return;
    }

    // Load and reconstruct groups with methods
    let groups = JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
    groups = groups.map(g => {
      const grp = new Group(g.name);
      grp.members = Array.isArray(g.members) ? g.members.slice() : [];
      grp.expenses = Array.isArray(g.expenses)
        ? g.expenses.map(e => new Expense(e.description || e.desription, e.amount, e.paidBy))
        : [];
      return grp;
    });

    let currentGroup = null;

    function persist() {
      localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));
    }

    // Render group list
    function renderGroups() {
      const list = document.getElementById("groupList");
      if (!list) return;
      list.innerHTML = "";

      if (groups.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.textContent = "No groups yet. Create your first group.";
        list.appendChild(li);
        return;
      }

      groups.forEach((g, idx) => {
        const li = document.createElement("li");
        li.textContent = g.name;
        li.addEventListener("click", () => openGroup(idx));
        list.appendChild(li);
      });

      persist();
    }

    // Open selected group
    function openGroup(index) {
      currentGroup = groups[index];
      document.getElementById("currentGroupName").textContent = currentGroup.name;
      document.getElementById("groupDetails").style.display = "block";
      renderBalances();
    }

    // Add group
    document.getElementById("createGroupBtn").addEventListener("click", () => {
      showLoader();
      try {
        const name = document.getElementById("groupName").value.trim();
        if (!name) {
          alert("Please enter a group name");
          return;
        }
        if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
          alert("A group with this name already exists.");
          return;
        }
        const newGroup = new Group(name);
        groups.push(newGroup);
        document.getElementById("groupName").value = "";
        renderGroups();
      } finally {
        setTimeout(hideLoader, 200);
      }
    });

    // Add member
    document.getElementById("addMemberBtn").addEventListener("click", () => {
      if (!currentGroup) return alert("Select a group first");
      showLoader();
      try {
        const member = document.getElementById("memberName").value.trim();
        if (!member) return;
        currentGroup.addMember(member);
        document.getElementById("memberName").value = "";
        renderBalances();
        persist();
      } finally {
        setTimeout(hideLoader, 150);
      }
    });

    // Add expense
    document.getElementById("addExpenseBtn").addEventListener("click", () => {
      if (!currentGroup) return alert("Select a group first");
      showLoader();
      try {
        const desc = document.getElementById("expenseDesc").value.trim();
        const amount = document.getElementById("expenseAmount").value;
        const paidBy = document.getElementById("expensePaidBy").value.trim();

        if (!desc || !amount || !paidBy) {
          alert("Please fill all expense fields");
          return;
        }
        currentGroup.addExpense(desc, amount, paidBy);
        document.getElementById("expenseDesc").value = "";
        document.getElementById("expenseAmount").value = "";
        document.getElementById("expensePaidBy").value = "";
        renderBalances();
        persist();
      } catch (e) {
        alert(e.message);
      } finally {
        setTimeout(hideLoader, 150);
      }
    });

    // Render balances
    function renderBalances() {
      if (!currentGroup) return;
      const list = document.getElementById("balanceList");
      if (!list) return;
      list.innerHTML = "";

      // Show helper if no members
      if (currentGroup.members.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.textContent = "No members in this group yet.";
        list.appendChild(li);
        return;
      }

      const balances = currentGroup.calculateBalances();
      balances.forEach((bal, member) => {
        const li = document.createElement("li");
        li.textContent = `${member}: ${bal >= 0 ? "gets back" : "owes"} $${Math.abs(bal).toFixed(2)}`;
        if (bal > 0) li.classList.add("positive");
        else if (bal < 0) li.classList.add("negative");
        list.appendChild(li);
      });
    }

    // Initial render
    renderGroups();

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      showLoader();
      if (typeof deleteCookie === "function") deleteCookie("loggedInUser");
      setTimeout(() => (window.location.href = "index.html"), 250);
    });

  } catch (err) {
    console.error("Groups page failed:", err);
    alert("Something went wrong loading Groups. Check console.");
  } finally {
    // Ensure the loader is hidden even if any error occurs
    hideLoader();
  }
});