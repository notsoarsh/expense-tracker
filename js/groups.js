class Expense {
  constructor(description, amount, paidBy) {
    this.description = description;
    this.amount = amount;
    this.paidBy = paidBy;
  }

  toJSON() {
    return {
      description: this.description,
      amount: this.amount,
      paidBy: this.paidBy,
    };
  }
}
class Group {
  constructor(name, createdBy) {
    this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9); // Generate unique ID
    this.name = name;
    this.createdBy = createdBy;
    this.members = [];
    this.expenses = [];
  }

  addMember(member) {
    if (!this.members.includes(member)) {
      this.members.push(member);
    }
  }

  addExpense(expenseObj) {
    // Accept an Expense object directly
    if (!this.members.includes(expenseObj.paidBy)) {
      throw new Error(`${expenseObj.paidBy} is not in this group`);
    }
    this.expenses.push(expenseObj);
  }

  calculateBalances() {
    const balances = new Map();
    this.members.forEach((m) => balances.set(m, 0));
    if (this.members.length === 0) return balances;

    const total = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const share = total / this.members.length;

    // Each payer gets credited their payments
    this.expenses.forEach((e) => {
      balances.set(e.paidBy, (balances.get(e.paidBy) || 0) + e.amount);
    });

    // Everyone owes their equal share
    this.members.forEach((m) => {
      balances.set(m, (balances.get(m) || 0) - share);
    });

    return balances;
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdBy: this.createdBy,
      members: this.members,
      expenses: this.expenses.map((e) => ({
        description: e.description,
        amount: e.amount,
        paidBy: e.paidBy,
      })),
    };
  }

  // Recreate from plain object
  static fromJSON(obj) {
    const group = new Group(obj.name, obj.createdBy);
    group.id = obj.id;
    group.members = obj.members || [];
    group.expenses = (obj.expenses || []).map(
      (e) => new Expense(e.description, e.amount, e.paidBy)
    );
    return group;
  }
}
