const { generateUniqueId } = require("../../utils");
const { BEST_SCORE } = require("../constants");
const GameError = require("./gameError");

module.exports = class Participant {
    constructor(name) {
        this.id = generateUniqueId();
        this.name = name;
        this.cards = [];
        this.possibleScores = new Set([0]);
        this.score = 0;
    }

    takeACard(card) {
        if (this.isBust()) throw new GameError(`Cannot pull a card if the player lost. Score: ${this.score}`);
        this.cards.push(card);
        calculatePossibleScores(this.possibleScores, card);
        this.score = calculateScore(this.possibleScores);
    }

    isBust() {
        return this.score > BEST_SCORE;
    }

    hasBlackJack() {
        return this.cards.length === 2 && this.score === BEST_SCORE;
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
