const User = require("./user");
const { BEST_SCORE } = require("./constants");

module.exports = class Participant extends User {
    constructor(id, name, totalAmount) {
        super(id, name, totalAmount);
        this.cards = [];
        this.possibleScores = new Set([0]);
        this.score = 0;
    }

    pullACard(card) {
        if (this.isBust()) throw new Error(`Cannot pull a card if the player lost. Score: ${this.score}`);
        this.cards.push(card);
        calculatePossibleScores(this.possibleScores, card);
        this.score = calculateScore(this.possibleScores);
        if (this.isBust()) this.outcome = "DEFEAT";
        if (!this.outcome) this.canBet = true;
    }

    isBust() {
        return this.score > BEST_SCORE;
    }
}

function calculatePossibleScores(possibleScores, card) {
    const oldPossibleScores = [...possibleScores];
    for (const oldScore of oldPossibleScores) {
        possibleScores.delete(oldScore);
        card.points.forEach(value => possibleScores.add(value + oldScore));
    }
}

function calculateScore(possibleScores) {
    const winningScores = [...possibleScores].filter(s => s <= BEST_SCORE);
    return (winningScores.length > 0)
        ? Math.max(...winningScores)
        : Math.min(...possibleScores);
}
