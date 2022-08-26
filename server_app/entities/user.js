const { generateUniqueId } = require("../utils");
const { BEST_SCORE } = require("./constants");

module.exports = class User {
    constructor(name, totalAmount) {
        this.name = name;
        this.totalAmount = totalAmount;

        this.id = generateUniqueId();
        this.cards = [];
        this.possibleScores = new Set([0]);
        this.score = 0;
    }

    pullACard(card) {
        if (this.score > BEST_SCORE) throw new Error("Cannot pull a card if the player lost.");
        this.cards.push(card);
        calculatePossibleScores(this.possibleScores, card);
        this.score = calculateScore(this.possibleScores);
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
