const { points } = require("../constants");

module.exports = class Card {
    constructor(rank, suit, deck = 0) {
        this.deck = deck;
        this.rank = rank;
        this.suit = suit;

        this.points = points[rank];
    }
}
