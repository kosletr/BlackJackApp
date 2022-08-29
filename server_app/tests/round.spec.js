const Client = require("../server/client");
const Player = require("../game/entities/player");
const Round = require("../game/entities/round");
const { loseByBust } = require("./testUtils");
const { OUTCOMES } = require("../game/constants");

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
            const client1 = new Client(null, "Kostas");
            player1 = new Player(client1);
        })

        it("should allow the first player to bet when a new round has just started.", () => {
            round = new Round([player1]);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the first player to hit, stand or doubledown when the first player chooses to bet.", () => {
            round = new Round([player1]);
            round.bet({ amount: 50 });

            // Not true if player has a blackjack
            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toContain("hit");
            expect(round.allowedMoves).toContain("stand");
            expect(round.allowedMoves).toContain("doubledown");
        })

        it("should not be able to do anything when player chooses to stand.", () => {
            round = new Round([player1]);
            round.bet({ amount: 50 });
            round.stand();

            expect(round.allowedMoves).toEqual([]);
        })

        it("should not be able to do anything when player loses.", () => {
            round = new Round([player1]);
            round.bet({ amount: 50 });
            loseByBust(round);

            expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
            expect(round.allowedMoves).toEqual([]);
        })

        it("should have a winner when dealer looses.", () => {
            round = new Round([player1]);
            round.dealer.play = loseByBust;

            round.bet({ amount: 50 });
            round.stand();

            // Not true if dealer has a blackjack
            expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
            expect(round.allowedMoves).toEqual([]);
        })
    })

    describe("Two Players", () => {
        beforeEach(() => {
            const client1 = new Client(null, "Kostas");
            player1 = new Player(client1);
            const client2 = new Client(null, "John");
            player2 = new Player(client2);
        })

        it("should allow the first player to bet when a new round has just started.", () => {
            round = new Round([player1, player2]);

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the second player to bet when the first player submited their bet.", () => {
            round = new Round([player1, player2]);
            round.bet({ amount: 50 });

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.allowedMoves).toEqual(["bet"]);
        })

        it("should allow the first player to play when the second player submited their bet.", () => {
            round = new Round([player1, player2]);
            round.bet({ amount: 50 });
            round.bet({ amount: 50 });

            // Not true if dealer has a blackjack
            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toContain("hit");
            expect(round.allowedMoves).toContain("stand");
            expect(round.allowedMoves).toContain("doubledown");
        })

        it("should allow the second player to play when the first player busts.", () => {
            round = new Round([player1, player2]);
            round.bet({ amount: 50 });
            round.bet({ amount: 50 });
            loseByBust(round);

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
            expect(round.players[1].outcome).toBeFalsy();
            expect(round.allowedMoves).toContain("hit");
            expect(round.allowedMoves).toContain("stand");
            expect(round.allowedMoves).toContain("doubledown");
        })

        it("should not be able to do anything when the second player chooses to stand.", () => {
            round = new Round([player1, player2]);
            round.bet({ amount: 50 });
            round.bet({ amount: 50 });
            round.stand();
            round.stand();

            expect(round.allowedMoves).toEqual([]);
        })

        it("should not be able to do anything when the second player loses.", () => {
            round = new Round([player1, player2]);
            round.bet({ amount: 50 });
            round.bet({ amount: 50 });
            round.stand(); // Cannot stand if player 2 has a blackjack
            loseByBust(round);

            expect(round.players[1].outcome).toBe(OUTCOMES.DEFEAT);
            expect(round.allowedMoves).toEqual([]);
        })

        it("should have two winners when dealer looses.", () => {
            round = new Round([player1, player2]);
            round.dealer.play = loseByBust;
            round.bet({ amount: 50 });
            round.bet({ amount: 50 });
            round.stand();
            round.stand();

            expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
            expect(round.players[1].outcome).toBe(OUTCOMES.WIN);
            expect(round.allowedMoves).toEqual([]);
        })
    })
})
