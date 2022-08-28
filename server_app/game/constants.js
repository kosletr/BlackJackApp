const { NUMBER_OF_DECKS } = require("./configurations");

const NUMBER_OF_RANKS = 13;
const NUMBER_OF_SUITS = 4;
const BEST_SCORE = 21;

const NUMBER_OF_CARDS_PER_DECK = NUMBER_OF_SUITS * NUMBER_OF_RANKS; // The two Jokers are omitted.
const NUMBER_OF_CARDS = NUMBER_OF_DECKS * NUMBER_OF_CARDS_PER_DECK;

const points = {
    "A": [11, 1],
    "2": [2],
    "3": [3],
    "4": [4],
    "5": [5],
    "6": [6],
    "7": [7],
    "8": [8],
    "9": [9],
    "10": [10],
    "J": [10],
    "Q": [10],
    "K": [10]
};

const suits = ["clubs", "diamonds", "hearts", "spades"];
const ranks = Object.keys(points);

const requiredParameters = {
    clientCommands: {
        registerClient: ["name"],
    },
    gameCommands: {
        startGame: [],
        startRound: [],
        exitGame: [],
    },
    roundCommands: {
        bet: ["amount"],
        hit: [],
        stand: [],
    }
}

const commands = Object
    .values(requiredParameters)
    .reduce((acc, curr) => ([...acc, ...Object.keys(curr)]), []);

const paramConstraints = Object
    .values(requiredParameters)
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

module.exports = {
    BEST_SCORE,
    NUMBER_OF_CARDS_PER_DECK,
    NUMBER_OF_CARDS,
    NUMBER_OF_RANKS,
    NUMBER_OF_SUITS,
    commands,
    paramConstraints,
    points,
    ranks,
    requiredParameters,
    suits,
};
