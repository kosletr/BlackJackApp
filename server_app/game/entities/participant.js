const { BEST_SCORE } = require("../constants");

module.exports = class Participant {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.cards = [];
        this.possibleScores = new Set([0]);
        this.score = 0;
    }

    pullACard(card) {
        if (this.isBust()) throw new Error(`Game: Cannot pull a card if the player lost. Score: ${this.score}`);
        this.cards.push(card);
        calculatePossibleScores(this.possibleScores, card);
        this.score = calculateScore(this.possibleScores);
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
