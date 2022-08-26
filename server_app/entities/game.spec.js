const { generateUniqueId } = require("../utils");
const Game = require("./game");
const User = require("./user");
const {  loseByBust } = require("./testUtils");

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

    it("should not be able to do no thing when player says stand.", () => {
        game.addUser(user1);
        game.startNextRound();

        const round = game.currentRound();
        round.bet(50);
        round.stand();

        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"],
            round: []
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
        loseByBust(round);
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
        round.dealer.play = loseByBust;

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
        round.dealer.play = loseByBust;

        round.bet(50);
        loseByBust(round);
        round.bet(30);
        round.stand();

        expect(round.players[0].outcome).toBe("DEFEAT");
        expect(round.players[1].outcome).toBe("WIN");
        expect(game.calculateAllowedMoves()).toEqual({
            game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"],
            round: []
        });
    })

    // it("should have two rounds.", () => {
    //     game.addUser(user1);

    //     game.startNextRound();
    //     const round1 = game.currentRound();
    //     round1.bet(50);
    //     loseByBust(round1);
    //     // game.finishRound();
    //     game.startNextRound();
    //     const round2 = game.currentRound();
    //     round2.bet(20);
    //     loseByBust(round2);
    //     // game.finishRound();

    //     expect(game.users[0].totalAmount).toBe(30);
    //     expect(game.calculateAllowedMoves()).toEqual({
    //         game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"],
    //         round: []
    //     });
    // })
})
