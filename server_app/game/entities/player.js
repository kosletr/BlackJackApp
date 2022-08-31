const { MIN_BET } = require("../configurations");
const { OUTCOMES } = require("../constants");
const GameError = require("./gameError");
const Participant = require("./participant");

module.exports = class Player extends Participant {
    constructor(client) {
        super(client.name, client.gameId);
        this.currentBet = 0;
        this.outcome = null;
        this.client = client;
    }

    bet(amount) {
        if (amount < MIN_BET || amount > this.client.totalAmount)
            throw new GameError(`Wager should be between the minimum bet (${MIN_BET}) and your total (${this.client.totalAmount})`);
        this.client.totalAmount -= amount;
        this.currentBet += amount;
    }

    clone(gameId = this.gameId) {
        return new Player(this.client, gameId);
    }

    split() {
        const firstHand = this.clone();
        const secondHand = this.clone();
        this.client.totalAmount += this.currentBet;
        firstHand.bet(this.currentBet);
        secondHand.bet(this.currentBet);
        firstHand.takeACard(this.cards.shift());
        secondHand.takeACard(this.cards.shift());
        return [firstHand, secondHand];
    }

    transferMoney(dealer) {
        if (this.isBust()) this.lose();
        else if (dealer.isBust()) this.win();
        else if (this.hasBlackJack() && !dealer.hasBlackJack()) this.win(3 / 2);
        else if (!this.hasBlackJack() && dealer.hasBlackJack()) this.lose();
        else if (this.score < dealer.score) this.lose();
        else if (this.score > dealer.score) this.win();
        else if (this.score === dealer.score) this.tie();
        else throw new GameError(`Invalid state.`);
    }

    win(winningRate = 1) {
        this.outcome = OUTCOMES.WIN;
        this.client.totalAmount += (1 + winningRate) * this.currentBet;
        this.currentBet = 0;
    }

    lose() {
        this.outcome = OUTCOMES.DEFEAT;
        this.currentBet = 0;
    }

    tie() {
        this.outcome = OUTCOMES.TIE;
        this.client.totalAmount += this.currentBet;
        this.currentBet = 0;
    }
}
