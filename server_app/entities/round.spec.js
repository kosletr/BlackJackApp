const Player = require("./player");
const Round = require("./round");
const { loseByBust } = require("./testUtils");

describe('Round', () => {
    let round;
    let player1;
    let player2;

    describe("No Players", () => {
        it("should throw an error when a new round is started without any players.", () => {
            expect(() => new Round([])).toThrow();
        })
    })

    describe("One Player", () => {
        beforeEach(() => {
            player1 = new Player("1", "Kostas");
        })

        it("should allow the first player to bet when a new round has just started.", () => {
            round = new Round([player1]);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the first player to hit or stand when the first player chooses to bet.", () => {
            round = new Round([player1]);
            round.bet(50);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["hit", "stand"]);
        })

        it("should not be able to do anything when player chooses to stand.", () => {
            round = new Round([player1]);
            round.bet(50);
            round.stand();

            expect(round.allowedMoves).toEqual([]);
        })

        it("should not be able to do anything when player loses.", () => {
            round = new Round([player1]);
            round.bet(50);
            loseByBust(round);

            expect(round.players[0].outcome).toBe("DEFEAT");
            expect(round.allowedMoves).toEqual([]);
        })

        it("should have a winner when dealer looses.", () => {
            round = new Round([player1]);
            round.dealer.play = loseByBust;

            round.bet(50);
            round.stand();

            expect(round.players[0].outcome).toBe("WIN");
            expect(round.allowedMoves).toEqual([]);
        })
    })

    describe("Two Players", () => {
        beforeEach(() => {
            player1 = new Player("1", "Kostas");
            player2 = new Player("2", "John");
        })

        it("should allow the first player to bet when a new round has just started.", () => {
            round = new Round([player1, player2]);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the first player to hit or stand when the first player chooses to bet.", () => {
            round = new Round([player1, player2]);
            round.bet(50);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["hit", "stand"]);
        })

        it("should allow the second player to bet when the first player chooses to stand.", () => {
            round = new Round([player1, player2]);
            round.bet(50);
            round.stand();

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the second player to bet when the first player busts.", () => {
            round = new Round([player1, player2]);
            round.bet(50);
            loseByBust(round);

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.players[0].outcome).toBe("DEFEAT");
            expect(round.players[1].outcome).toBeFalsy();
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the second player to hit or stand when the second player chooses to bet.", () => {
            round = new Round([player1, player2]);
            round.stand();
            round.bet(50);

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.allowedMoves).toEqual(["hit", "stand"]);
        })

        it("should not be able to do anything when the second player chooses to stand.", () => {
            round = new Round([player1, player2]);
            round.stand();
            round.bet(50);
            round.stand();

            expect(round.allowedMoves).toEqual([]);
        })

        it("should not be able to do anything when the second player loses.", () => {
            round = new Round([player1, player2]);
            round.stand();
            round.bet(50);
            loseByBust(round);

            expect(round.players[1].outcome).toBe("DEFEAT");
            expect(round.allowedMoves).toEqual([]);
        })

        it("should have two winners when dealer looses.", () => {
            round = new Round([player1, player2]);
            round.dealer.play = loseByBust;
            round.stand();

            round.bet(50);
            round.stand();

            expect(round.players[0].outcome).toBe("WIN");
            expect(round.players[1].outcome).toBe("WIN");
            expect(round.allowedMoves).toEqual([]);
        })
    })





    // it("should have one winner and one loser when only a player is not bust.", () => {
    //     round.addClient(player1);
    //     round.addClient(player2);
    //     round.startGame();

    //     const round = round.currentRound;
    //     round.dealer.play = loseByBust;

    //     round.bet(50);
    //     loseByBust(round);
    //     round.bet(30);
    //     round.stand();

    //     expect(round.players[0].outcome).toBe("DEFEAT");
    //     expect(round.players[1].outcome).toBe("WIN");
    //     expect(round.allowedMoves).toEqual(["addClient", "removeClientById", "startGame"]);
    // })
})
