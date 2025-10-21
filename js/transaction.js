class Transaction {
  //private field
  #amount;

  constructor(desc, amount, type, category, date) {
    this.desc = desc;
    this.#amount = parseFloat(amount);
    this.type = type;
    this.category = category;
    this.date = date;
  }

  //getter
  get amount() {
    return this.#amount;
  }

  //setter with validation
  set amount(val) {
    if (val >= 0) {
      this.#amount = parseFloat(val);
    } else {
      console.error("Amount must be non-negative!");
    }
  }

  toJSON() {
    return {
      desc: this.desc,
      amount: this.#amount,
      type: this.type,
      category: this.category,
      date: this.date,
    };
  }

  static fromJSON(obj) {
    return new Transaction(
      obj.desc,
      obj.amount,
      obj.type,
      obj.category,
      obj.date
    );
  }
}
