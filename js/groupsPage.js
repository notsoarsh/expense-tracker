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

  document.getElementById("userEmail").textContent = `Welcome, ${currentUser}`;

  // Update pending invites indicator
  const pendingInvites =
    JSON.parse(localStorage.getItem(`pendingInvites_${currentUser}`)) || [];
  const pendingCount = pendingInvites.length;
  document.getElementById(
    "inviteIndicator"
  ).textContent = `Invites (${pendingCount})`;

  setTimeout(() => {
    loadGroups(currentUser);
    hideLoader();
  }, 500);

  // Logout handler - FIX THE TYPO HERE
  document.getElementById("logoutBtn").addEventListener("click", () => {
    showLoader();
    deleteCookie("loggedInUser");
    toast.success("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "index.html"; // FIXED: was window.localStorage.href
    }, 800);
  });

  // Create Group Form
  document.getElementById("createGroupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const groupName = document.getElementById("groupName").value.trim();

    if (!groupName) {
      toast.warning("Please enter a group name!");
      return;
    }

    showLoader();

    setTimeout(() => {
      const newGroup = new Group(groupName, currentUser);
      newGroup.addMember(currentUser);

      let groups =
        JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
      groups.push(newGroup.toJSON());
      localStorage.setItem(`groups_${currentUser}`, JSON.stringify(groups));

      document.getElementById("createGroupForm").reset();
      loadGroups(currentUser);
      hideLoader();
      toast.success(`Group "${groupName}" created successfully!`);
    }, 300);
  });

  // Add Expense Form
  document.getElementById("addExpenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    showLoader();

    const groupId = document.getElementById("expenseGroupSelect").value;
    const description = document.getElementById("expenseDesc").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const paidBy = document.getElementById("expensePaidBy").value;

    if (!groupId) {
      hideLoader();
      toast.error("Please select a group!");
      return;
    }

    if (!description || !amount || amount <= 0) {
      hideLoader();
      toast.error("Please provide valid expense details!");
      return;
    }

    if (!paidBy) {
      hideLoader();
      toast.error("Please select who paid!");
      return;
    }

    setTimeout(() => {
      try {
        // Get current user's groups
        let currentUserGroups =
          JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
        let group = currentUserGroups.find((g) => g.id === groupId);

        if (!group) {
          hideLoader();
          toast.error("Group not found!");
          return;
        }

        // Reconstruct as Group object
        group = Group.fromJSON(group);

        // Create and add expense
        const expense = new Expense(description, amount, paidBy);
        group.addExpense(expense);

        // Update current user's storage
        const groupIndex = currentUserGroups.findIndex((g) => g.id === groupId);
        currentUserGroups[groupIndex] = group.toJSON();
        localStorage.setItem(
          `groups_${currentUser}`,
          JSON.stringify(currentUserGroups)
        );

        // **SYNC TO ALL MEMBERS** - Update the group for all members
        if (group.members && Array.isArray(group.members)) {
          group.members.forEach((member) => {
            // Get member's groups
            let memberGroups =
              JSON.parse(localStorage.getItem(`groups_${member}`)) || [];
            const memberGroupIndex = memberGroups.findIndex(
              (g) => g.id === groupId
            );

            if (memberGroupIndex !== -1) {
              // Update the member's copy of this group
              memberGroups[memberGroupIndex] = group.toJSON();
              localStorage.setItem(
                `groups_${member}`,
                JSON.stringify(memberGroups)
              );
            }
          });
        }

        loadGroups(currentUser);
        document.getElementById("addExpenseForm").reset();
        hideLoader();
        toast.success("Expense added successfully and synced to all members!");
      } catch (error) {
        console.error("Error adding expense:", error);
        hideLoader();
        toast.error(error.message || "Failed to add expense!");
      }
    }, 300);
  });

  // Invite Member Form
  document
    .getElementById("inviteMemberForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const groupId = document.getElementById("inviteGroupSelect").value;
      const inviteEmail = document
        .getElementById("inviteEmail")
        .value.trim()
        .toLowerCase();

      // Validation
      if (!groupId) {
        toast.warning("Please select a group!");
        return;
      }

      if (!inviteEmail) {
        toast.warning("Please enter an email address!");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        toast.error("Please enter a valid email address!");
        return;
      }

      if (inviteEmail === currentUser) {
        toast.warning("You cannot invite yourself!");
        return;
      }

      showLoader();

      setTimeout(() => {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const invitedUser = users.find(
          (u) => u.email.toLowerCase() === inviteEmail
        );

        if (!invitedUser) {
          hideLoader();
          toast.error("User not found! Please check the email address.");
          return;
        }

        let groups =
          JSON.parse(localStorage.getItem(`groups_${currentUser}`)) || [];
        const group = groups.find((g) => g.id === groupId);

        if (!group) {
          hideLoader();
          toast.error("Group not found!");
          return;
        }

        // Check if user is already a member
        if (group.members && group.members.includes(inviteEmail)) {
          hideLoader();
          toast.warning("This user is already a member of the group!");
          return;
        }

        // Check if invitation already sent
        let pendingInvites =
          JSON.parse(localStorage.getItem(`pendingInvites_${inviteEmail}`)) ||
          [];
        const alreadyInvited = pendingInvites.some(
          (inv) => inv.groupId === groupId && inv.from === currentUser
        );

        if (alreadyInvited) {
          hideLoader();
          toast.warning("Invitation already sent to this user!");
          return;
        }

        // Create invitation
        const invitation = {
          groupId: groupId,
          groupName: group.name,
          from: currentUser,
          to: inviteEmail,
          date: new Date().toISOString(),
        };

        pendingInvites.push(invitation);
        localStorage.setItem(
          `pendingInvites_${inviteEmail}`,
          JSON.stringify(pendingInvites)
        );

        document.getElementById("inviteMemberForm").reset();
        hideLoader();
        toast.success(`Invitation sent to ${inviteEmail}!`);
      }, 300);
    });

  // View Invites Button
  const viewInvitesBtn = document.getElementById("viewInvitesBtn");
  if (viewInvitesBtn) {
    viewInvitesBtn.addEventListener("click", () => {
      showLoader();
      setTimeout(() => {
        displayInvites(currentUser);
        hideLoader();
      }, 300);
    });
  }
});

// Load and display all groups
function loadGroups(userEmail) {
  let groups = JSON.parse(localStorage.getItem(`groups_${userEmail}`)) || [];

  // Reconstruct Group objects
  groups = groups.map((g) => {
    const grp = new Group(g.name, g.createdBy);
    grp.id = g.id;
    grp.members = g.members || [];
    grp.expenses = Array.isArray(g.expenses)
      ? g.expenses.map((e) => new Expense(e.description, e.amount, e.paidBy))
      : [];
    return grp;
  });

  const groupsList = document.getElementById("groupsList");
  groupsList.innerHTML = "";

  if (groups.length === 0) {
    groupsList.innerHTML = `
      <div class="alert alert-info" role="status">
        <p>No groups yet. Create your first group to get started!</p>
      </div>
    `;
    updateGroupSelects([]);
    return;
  }

  groups.forEach((group) => {
    const card = document.createElement("div");
    card.className = "group-card";

    const totalExpenses = group.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balances = group.calculateBalances();

    let balancesHTML = "";
    balances.forEach((balance, member) => {
      const balanceClass =
        balance > 0
          ? "text-success"
          : balance < 0
          ? "text-danger"
          : "text-muted";
      const balanceText =
        balance > 0
          ? `is owed $${Math.abs(balance).toFixed(2)}`
          : balance < 0
          ? `owes $${Math.abs(balance).toFixed(2)}`
          : "settled";

      balancesHTML += `
        <div class="balance-item">
          <strong>${member === userEmail ? "You" : member}:</strong>
          <span class="${balanceClass}">${balanceText}</span>
        </div>
      `;
    });

    let expensesHTML = "";
    if (group.expenses.length === 0) {
      expensesHTML = '<p class="text-muted">No expenses yet.</p>';
    } else {
      group.expenses.forEach((expense) => {
        expensesHTML += `
          <div class="expense-item">
            <div>
              <strong>${expense.description}</strong>
              <small class="text-muted">Paid by ${
                expense.paidBy === userEmail ? "You" : expense.paidBy
              }</small>
            </div>
            <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <div class="group-header">
        <h3>${group.name}</h3>
        <span class="badge bg-primary">${group.members.length} member${
      group.members.length !== 1 ? "s" : ""
    }</span>
      </div>
      <div class="group-body">
        <div class="group-section">
          <h4>Members</h4>
          <div class="members-list">
            ${group.members
              .map(
                (m) =>
                  `<span class="member-badge">${
                    m === userEmail ? "You" : m
                  }</span>`
              )
              .join("")}
          </div>
        </div>
        <div class="group-section">
          <h4>Total Expenses: <span class="text-primary">$${totalExpenses.toFixed(
            2
          )}</span></h4>
          ${expensesHTML}
        </div>
        <div class="group-section">
          <h4>Balances</h4>
          ${balancesHTML}
        </div>
      </div>
      <div class="group-footer">
        <button class="btn btn-sm btn-danger delete-group-btn" data-group-id="${
          group.id
        }">
          Delete Group
        </button>
      </div>
    `;

    groupsList.appendChild(card);
  });

  // Attach delete listeners
  attachDeleteGroupListeners(userEmail);

  // Update dropdowns
  updateGroupSelects(groups);
}

// Update group selection dropdowns
function updateGroupSelects(groups) {
  const expenseSelect = document.getElementById("expenseGroupSelect");
  const inviteSelect = document.getElementById("inviteGroupSelect");

  expenseSelect.innerHTML = '<option value="">-- Select Group --</option>';
  inviteSelect.innerHTML = '<option value="">-- Select Group --</option>';

  groups.forEach((group) => {
    const option1 = document.createElement("option");
    option1.value = group.id;
    option1.textContent = group.name;
    expenseSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = group.id;
    option2.textContent = group.name;
    inviteSelect.appendChild(option2);
  });
}

// Delete group handler
function attachDeleteGroupListeners(userEmail) {
  document.querySelectorAll(".delete-group-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const groupId = btn.getAttribute("data-group-id");

      toast.confirm(
        "Are you sure you want to delete this group? All expenses will be lost.",
        () => {
          showLoader();
          setTimeout(() => {
            try {
              // Get current user's groups
              let groups =
                JSON.parse(localStorage.getItem(`groups_${userEmail}`)) || [];

              // Find the group to delete
              const groupToDelete = groups.find((g) => g.id === groupId);

              if (!groupToDelete) {
                hideLoader();
                toast.error("Group not found!");
                return;
              }

              // Remove group from current user's storage
              groups = groups.filter((g) => g.id !== groupId);
              localStorage.setItem(
                `groups_${userEmail}`,
                JSON.stringify(groups)
              );

              // Remove group from all members' storage
              if (
                groupToDelete.members &&
                Array.isArray(groupToDelete.members)
              ) {
                groupToDelete.members.forEach((member) => {
                  if (member !== userEmail) {
                    let memberGroups =
                      JSON.parse(localStorage.getItem(`groups_${member}`)) ||
                      [];
                    memberGroups = memberGroups.filter((g) => g.id !== groupId);
                    localStorage.setItem(
                      `groups_${member}`,
                      JSON.stringify(memberGroups)
                    );
                  }
                });
              }

              // Remove any pending invites for this group
              const allUsers = JSON.parse(localStorage.getItem("users")) || [];
              allUsers.forEach((user) => {
                let userInvites =
                  JSON.parse(
                    localStorage.getItem(`pendingInvites_${user.email}`)
                  ) || [];
                const originalLength = userInvites.length;
                userInvites = userInvites.filter(
                  (inv) => inv.groupId !== groupId
                );

                if (userInvites.length !== originalLength) {
                  localStorage.setItem(
                    `pendingInvites_${user.email}`,
                    JSON.stringify(userInvites)
                  );

                  // Update invite count if it's the current user
                  if (user.email === userEmail) {
                    document.getElementById(
                      "inviteIndicator"
                    ).textContent = `Invites (${userInvites.length})`;
                  }
                }
              });

              // Reload the UI
              loadGroups(userEmail);
              hideLoader();
              toast.success("Group deleted successfully!");
            } catch (error) {
              console.error("Error deleting group:", error);
              hideLoader();
              toast.error("Failed to delete group. Please try again.");
            }
          }, 300);
        }
      );
    });
  });
}

// Display pending invites
function displayInvites(userEmail) {
  let invites =
    JSON.parse(localStorage.getItem(`pendingInvites_${userEmail}`)) || [];

  const invitesList = document.getElementById("invitesList");
  invitesList.innerHTML = "";

  if (invites.length === 0) {
    invitesList.innerHTML = `
      <div class="alert alert-info" role="status">
        <p>No pending invitations.</p>
      </div>
    `;
    return;
  }

  invites.forEach((invite, index) => {
    const inviteCard = document.createElement("div");
    inviteCard.className = "invite-card";

    const inviteDate = new Date(invite.date).toLocaleDateString();

    inviteCard.innerHTML = `
      <div class="invite-header">
        <h4>${invite.groupName}</h4>
        <small class="text-muted">Invited by ${invite.from}</small>
      </div>
      <div class="invite-body">
        <small>Received on ${inviteDate}</small>
      </div>
      <div class="invite-actions">
        <button class="btn btn-sm btn-success accept-invite-btn" data-index="${index}">
          Accept
        </button>
        <button class="btn btn-sm btn-danger reject-invite-btn" data-index="${index}">
          Reject
        </button>
      </div>
    `;

    invitesList.appendChild(inviteCard);
  });

  // Attach accept/reject listeners
  attachInviteListeners(userEmail);
}

// Handle accept/reject invitations
function attachInviteListeners(userEmail) {
  // Accept invite
  document.querySelectorAll(".accept-invite-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      showLoader();

      setTimeout(() => {
        let invites =
          JSON.parse(localStorage.getItem(`pendingInvites_${userEmail}`)) || [];
        const invite = invites[index];

        if (!invite) {
          hideLoader();
          toast.error("Invitation not found!");
          return;
        }

        // Add user to the group (in the creator's storage)
        let creatorGroups =
          JSON.parse(localStorage.getItem(`groups_${invite.from}`)) || [];
        const groupIndex = creatorGroups.findIndex(
          (g) => g.id === invite.groupId
        );

        if (groupIndex !== -1) {
          const group = Group.fromJSON(creatorGroups[groupIndex]);

          if (!group.members.includes(userEmail)) {
            group.addMember(userEmail);
            creatorGroups[groupIndex] = group.toJSON();
            localStorage.setItem(
              `groups_${invite.from}`,
              JSON.stringify(creatorGroups)
            );

            // Also add to user's own groups list
            let userGroups =
              JSON.parse(localStorage.getItem(`groups_${userEmail}`)) || [];
            userGroups.push(group.toJSON());
            localStorage.setItem(
              `groups_${userEmail}`,
              JSON.stringify(userGroups)
            );
          }
        }

        // Remove the invite
        invites.splice(index, 1);
        localStorage.setItem(
          `pendingInvites_${userEmail}`,
          JSON.stringify(invites)
        );

        // Update invite count
        document.getElementById(
          "inviteIndicator"
        ).textContent = `Invites (${invites.length})`;

        displayInvites(userEmail);
        loadGroups(userEmail);
        hideLoader();
        toast.success("Invitation accepted! You've joined the group.");
      }, 300);
    });
  });

  // Reject invite
  document.querySelectorAll(".reject-invite-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));

      toast.confirm("Are you sure you want to reject this invitation?", () => {
        showLoader();
        setTimeout(() => {
          let invites =
            JSON.parse(localStorage.getItem(`pendingInvites_${userEmail}`)) ||
            [];
          invites.splice(index, 1);
          localStorage.setItem(
            `pendingInvites_${userEmail}`,
            JSON.stringify(invites)
          );

          // Update invite count
          document.getElementById(
            "inviteIndicator"
          ).textContent = `Invites (${invites.length})`;

          displayInvites(userEmail);
          hideLoader();
          toast.info("Invitation rejected.");
        }, 300);
      });
    });
  });
}
