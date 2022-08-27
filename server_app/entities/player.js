const Participant = require("./participant");
const { INITIAL_AMOUNT, MIN_BET } = require("./config");

module.exports = class Player extends Participant {
    constructor(id, name) {
        super(id, name, INITIAL_AMOUNT);
        this.currentBet = 0;
        this.outcome = null;
        this.canBet = false;
    }

    bet(amount) {
        if (amount <= MIN_BET || amount > this.totalAmount)
            throw new Error("Invalid amount provided: ", this.totalAmount);
        this.totalAmount -= amount;
        this.currentBet += amount;
        this.canBet = false;
    }
}
