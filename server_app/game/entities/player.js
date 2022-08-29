const GameError = require("./gameError");
const Participant = require("./participant");

module.exports = class Player extends Participant {
    constructor(client) {
        super(client.id, client.name);
        this.currentBet = 0;
        this.outcome = null;
        this.canBet = false;
        this.client = client;
    }

    bet(amount) {
        if (amount < 0 || amount > this.client.totalAmount)
            throw new GameError("Invalid amount provided: "+ amount);
        this.client.totalAmount -= amount;
        this.currentBet += amount;
        this.canBet = false;
    }

    transferMoney(dealer) {
        if (this.isBust()) {
            this.outcome = "DEFEAT";
        } else if (dealer.isBust()) {
            this.outcome = "WIN";
            this.client.totalAmount += 2 * this.currentBet;
        } else if (this.score < dealer.score) {
            this.outcome = "DEFEAT";
        } else if (this.score === dealer.score) {
            this.outcome = "TIE";
            this.client.totalAmount += this.currentBet;
        } else if (this.score > dealer.score) {
            this.outcome = "WIN";
            this.client.totalAmount += 2 * this.currentBet;
        } else {
            throw new GameError(`Invalid state. PlayerId: ${this.id} Score: ${this.score} Dealer Score: ${this.dealer.score}`);
        }
        this.currentBet = 0;
    }
}
