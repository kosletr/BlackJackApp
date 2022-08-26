const User = require("./user");

module.exports = class Player extends User {
    constructor(name, totalAmount) {
        super(name, totalAmount);
        this.currentBet = 0;
    }

    bet(amount) {
        if (amount > this.totalAmount)
            throw new Error("Amount cannot exceed totalAmount: ", this.totalAmount);
        this.totalAmount -= amount;
        this.currentBet = amount;
    }

}
