const { shuffleArray } = require("../../utils");
const { ranks, suits, NUMBER_OF_RANKS, NUMBER_OF_SUITS, NUMBER_OF_CARDS } = require("../constants");
const { NUMBER_OF_DECKS } = require("../configurations");
const Card = require("./card");
const GameError = require("./gameError");

module.exports = class GameCards {
    constructor() {
        this.remainingCards = initCards();
        this.size = NUMBER_OF_CARDS;
    }

    take() {
        if (this.size === 0)
            throw new GameError("No cards left!");
        const card = this.remainingCards[--this.size]
        this.remainingCards[this.size] = null;
        return card;
    }
}

function initCards() {
    let i = 0;
    const remainingCards = [];
    for (let d = 0; d < NUMBER_OF_DECKS; d++)
        for (let r = 0; r < NUMBER_OF_RANKS; r++)
            for (let s = 0; s < NUMBER_OF_SUITS; s++)
                remainingCards[i++] = new Card(ranks[r], suits[s], d);
    shuffleArray(remainingCards);
    return remainingCards;
}
