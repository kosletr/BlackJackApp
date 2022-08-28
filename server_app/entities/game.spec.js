const Client = require("./client");
const Game = require("./game");
const { loseByBust } = require("./testUtils");

describe('game', () => {
    let game;
    let client1;
    let client2;

    beforeEach(() => {
        const ws = { send: () => { } };
        client1 = new Client(ws, "Kostas");
        client2 = new Client(ws, "John");
    })

    describe('No rounds', () => {
        beforeEach(() => game = new Game())

        it("should throw an error when a new game is started without any players.", () => {
            expect(() => game.startGame()).toThrow();
        })

        it("should allow the client to start the game when there is at least one player", () => {
            game.addClient(client1);

            expect(game.allowedMoves).toEqual(new Set(["startGame"]));
        })
    })

    describe('One round', () => {
        beforeEach(() => game = new Game())

        it("should allow the client to exit the game when a new game is started", () => {
            game.addClient(client1);
            game.startGame();

            expect(game.allowedMoves).toEqual(new Set(["exitGame"]));
        })
    })

    describe('Two rounds', () => {

        it("should ... when ...", () => {

        })
    })
})