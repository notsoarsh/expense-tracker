//Logic for groups

class Expense {
  constructor(description, amount, paidBy) {
    this.description = description;
    this.amount = parseFloat(amount);
    this.paidBy = paidBy; //member name
  }
}

class Group {
  constructor(name) {
    this.name = name;
    this.members = [];
    this.expenses = [];
  }

  addMember(member) {
    if (!this.members.includes(member)) {
      this.members.push(member);
    }
  }

  addExpense(description, amount, paidBy) {
    if (!this.members.includes(paidBy)) {
      throw new Error(`${paidBy} is not in this group`);
    }
    this.expenses.push(new Expense(description, amount, paidBy));
  }

  calculateBalances() {
    let total = this.expenses.reduce((sum, e) => sum +e.amount, 0);
    let share = total / this.members.length;

    let balances = new Map();
    this.members.forEach(m => balances.set(m, 0));
    // Each payer gets credited their payments
    this.expenses.forEach(e => {
      balances.set(e.paidBy, balances.get(e.paidBy) + e.amount);
    });
    // Everyone owes their equal share
    this.members.forEach(m => {
      balances.set(m, balances.get(m) - share);
    });

    return balances;
  }
}
//export this group object to window scope
window.Group = Group;
window.Expense = Expense;
