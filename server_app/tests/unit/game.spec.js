const Client = require("../../game/entities/client");
const Game = require("../../game/entities/game");
const { drawCustomCards } = require("./testUtils");

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
            expect(() => game.startNextRound()).toThrow("without");
        })

        it("should allow the client to start the game when there is at least one player", () => {
            game.addClient(client1);
            game.addClient(client2);

            expect(game.allowedMoves).toEqual(["startGame"]);
            expect(game.currentRound).toBeFalsy();
        })
    })

    describe('One round', () => {
        beforeEach(() => game = new Game())

        it("should allow the client to exit the game when a new game is started", () => {
            game.addClient(client1);
            game.addClient(client2);
            game.startNextRound();

            expect(game.allowedMoves).toEqual(["exitGame"]);
            expect(game.currentRound).toBeTruthy();
        })

        it("should allow the client to exit the game when a new game is started", () => {
            game.addClient(client1);
            game.addClient(client2);
            game.startNextRound();
            const clientId = client1.id;
            game.exitGame({ clientId });

            expect(game.allowedMoves).toEqual(["exitGame"]);
            expect(game.currentRound).toBeTruthy();
        })

        it("should allow the client to exit the game when a new game is started", () => {
            game.addClient(client1);
            game.addClient(client2);
            game.startNextRound();
            const clientId = client2.id;
            game.exitGame({ clientId });

            expect(game.allowedMoves).toEqual(["exitGame"]);
            expect(game.currentRound).toBeTruthy();
        })

        it("should have no players in the game when exiting the game.", () => {
            game.addClient(client1);
            game.startNextRound();
            const clientId = client1.id;
            game.exitGame({ clientId });

            expect(game.currentRound.players.length).toBe(0);
        })

        it("should have one player in the next round when one player exits after the round is completed.", () => {
            game.addClient(client1);
            game.addClient(client2);
            game.startNextRound();
            game.currentRound.bet({ playerId: game.currentRound.players[0].id, amount: 50 });
            game.currentRound.bet({ playerId: game.currentRound.players[1].id, amount: 50 });
            game.currentRound.stand();
            game.currentRound.stand();

            game.exitGame({ clientId: client2.id });
            game.startNextRound({ clientId: client1.id });

            expect(game.currentRound.players.length).toBe(1);
        })

        it("should have two players when round starts after a round of two splits.", () => {
            game.addClient(client1);
            game.addClient(client2);
            game.startGame();
            game.currentRound.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }
            ]);

            game.currentRound.bet({ playerId: game.currentRound.players[0].id, amount: 50 });
            game.currentRound.bet({ playerId: game.currentRound.players[1].id, amount: 50 });
            game.currentRound.split();
            game.currentRound.hit();
            game.currentRound.stand();
            game.currentRound.stand();
            game.currentRound.split();
            game.currentRound.stand();
            game.currentRound.stand();

            game.startNextRound({ clientId: client1.id });

            expect(game.currentRound.players.length).toBe(2);
        })

    })

})