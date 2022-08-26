const { getRandomInt, create3DArray } = require("../utils");
const { ranks, suits, NUMBER_OF_DECKS, NUMBER_OF_RANKS, NUMBER_OF_SUITS, NUMBER_OF_CARDS } = require("./constants");
const Card = require("./card");

module.exports = class GameCards {
    constructor() {
        this.remainingCards = initCards();
        this.size = NUMBER_OF_CARDS;
    }

    take() {
        if (this.size === 0)
            throw new Error("No cards left!");
        this.size--;

        let card, d, r, s;
        let inTheGame = false;
        while (!inTheGame) {
            d = getRandomInt(NUMBER_OF_DECKS);
            r = getRandomInt(NUMBER_OF_RANKS);
            s = getRandomInt(NUMBER_OF_SUITS);
            card = this.remainingCards[d][r][s];
            inTheGame = Boolean(card);
        }

        this.remainingCards[d][r][s] = null;
        return card;
    }
}

function initCards() {
    const remainingCards = create3DArray(NUMBER_OF_DECKS, NUMBER_OF_RANKS, NUMBER_OF_SUITS);
    iterateCards((d, r, s) => remainingCards[d][r][s] = new Card(ranks[r], suits[s], d));
    return remainingCards;
}

function iterateCards(func) {
    for (let d = 0; d < NUMBER_OF_DECKS; d++)
        for (let r = 0; r < NUMBER_OF_RANKS; r++)
            for (let s = 0; s < NUMBER_OF_SUITS; s++)
                func(d, r, s);
}
