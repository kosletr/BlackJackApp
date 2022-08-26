const GameCards = require("./gameCards");
const { NUMBER_OF_CARDS } = require("./constants");

describe("GameCards", () => {
    let gameCards;

    beforeEach(() => gameCards = new GameCards())

    it("should contain all cards when the game begins.", () => {
        expect(gameCards.size).toBe(NUMBER_OF_CARDS);
    })

    it("should contain one less card when a card is pulled.", () => {
        gameCards.take();
        expect(gameCards.size).toBe(NUMBER_OF_CARDS - 1);
    })

    it("should contain no cards when all the cards are pulled.", () => {
        for (let i = 0; i < NUMBER_OF_CARDS; i++)
            gameCards.take();
        expect(gameCards.size).toBe(0);
    })

    it("should throw an error when there are no cards and a card is pulled.", () => {
        for (let i = 0; i < NUMBER_OF_CARDS; i++)
            gameCards.take();
        expect(() => gameCards.take()).toThrow();
    })
})
