const { generateUniqueId } = require("../utils");
const Game = require("./game");
const User = require("./user");
const { loseByTakingTooManyCards } = require("./utils");

describe('Game', () => {
    let game;
    let user1;
    let user2;

    beforeEach(() => {
        game = new Game();
        user1 = new User(generateUniqueId(), "Kostas", 100);
        user2 = new User(generateUniqueId(), "John", 100);
    })

    it("should throw an error when a new round is started without any players.", () => {
        game.addUser(user1);
        game.addUser(user2);
        game.removeUserById(user1.id);
        game.removeUserById(user2.id);

        expect(() => game.startNextRound()).toThrow();
    })

    it("should allow the first player to bet when a new round has just started.", () => {
        game.addUser(user1);
        game.startNextRound();

        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById"],
            round: ["bet"]
        });
    })

    it("should be able to hit and stand when a player has made a bet.", () => {
        game.addUser(user1);
        game.addUser(user2);
        game.startNextRound();

        const round = game.currentRound();
        round.bet(50);
        round.stand();
        round.bet(20);

        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById"],
            round: ["hit", "stand"]
        });
    })

    it("should be able to hit and stand when the player has hit and not lost.", () => {
        game.addUser(user1);
        game.addUser(user2);
        game.startNextRound();

        const round = game.currentRound();
        round.bet(50);
        loseByTakingTooManyCards(round);
        round.stand();
        round.bet(20);

        expect(round.players[0].outcome).toBe("DEFEAT");
        expect(round.players[1].outcome).toBeFalsy();
        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById"],
            round: ["hit", "stand"]
        });
    })

    it("should have only winners when dealer is bust and players are not.", () => {
        game.addUser(user1);
        game.addUser(user2);
        game.startNextRound();

        const round = game.currentRound();
        round.dealer.play = loseByTakingTooManyCards;

        round.bet(50);
        round.stand();
        round.bet(30);
        round.stand();

        expect(round.players[0].outcome).toBe("WIN");
        expect(round.players[1].outcome).toBe("WIN");
        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"],
            round: []
        });
    })

    it("should have one winner and one loser when only a player is not bust.", () => {
        game.addUser(user1);
        game.addUser(user2);
        game.startNextRound();

        const round = game.currentRound();
        round.dealer.play = loseByTakingTooManyCards;

        round.bet(50);
        loseByTakingTooManyCards(round);
        round.stand();
        round.bet(30);
        round.stand();

        expect(round.players[0].outcome).toBe("DEFEAT");
        expect(round.players[1].outcome).toBe("WIN");
        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"],
            round: []
        });
    })

})
