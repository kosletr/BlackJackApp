const { NUMBER_OF_DECKS } = require("./config");

const NUMBER_OF_RANKS = 13;
const NUMBER_OF_SUITS = 4;
const BEST_SCORE = 21;

const NUMBER_OF_CARDS_PER_DECK = NUMBER_OF_SUITS * NUMBER_OF_RANKS; // The two Jokers are omitted.
const NUMBER_OF_CARDS = NUMBER_OF_DECKS * NUMBER_OF_CARDS_PER_DECK;

const suits = ["cups", "coins", "clubs", "swords"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const points = { "A": [11, 1], "2": [2], "3": [3], "4": [4], "5": [5], "6": [6], "7": [7], "8": [8], "9": [9], "10": [10], "J": [10], "Q": [10], "K": [10] };

const requiredParameters = {
    register: ["name"],
    startGame: [],
    exitGame: [],
    bet: ["amount"],
    hit: [],
    stand: [],
}

module.exports = { BEST_SCORE, NUMBER_OF_SUITS, NUMBER_OF_RANKS, NUMBER_OF_CARDS_PER_DECK, NUMBER_OF_CARDS, ranks, suits, points, requiredParameters };
