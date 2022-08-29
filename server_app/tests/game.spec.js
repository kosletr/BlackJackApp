const Client = require("../server/client");
const Game = require("../game/entities/game");

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
            expect(() => game.startRound()).toThrow("players");
        })

        it("should allow the client to start the game when there is at least one player", () => {
            game.addClient(client1);

            expect(game.allowedMoves).toEqual(["startGame"]);
        })
    })

    describe('One round', () => {
        beforeEach(() => game = new Game())

        it("should allow the client to exit the game when a new game is started", () => {
            game.addClient(client1);
            game.startRound();

            expect(game.allowedMoves).toEqual(["exitGame"]);
        })
    })

    describe('Two rounds', () => {

        it("should ... when ...", () => {

        })
    })
})