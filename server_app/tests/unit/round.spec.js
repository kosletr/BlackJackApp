const Client = require("../../server/client");
const Player = require("../../game/entities/player");
const Round = require("../../game/entities/round");
const { drawCustomCards } = require("./testUtils");
const { OUTCOMES, ACTIONS } = require("../../game/constants");
const { INITIAL_AMOUNT, MIN_BET } = require("../../game/configurations");

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
            round = new Round([player1]);
        })

        it("should allow the first player to bet when a new round has just started.", () => {

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should throw when player tries to bet a wager less than the minimum bet.", () => {
            const wager = { amount: MIN_BET - 1 };

            expect(() => round.bet(wager)).toThrow("min");
            expect(round.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should throw when player tries to bet a wager greater than their total.", () => {
            const wager = { amount: INITIAL_AMOUNT + 1 };

            expect(() => round.bet(wager)).toThrow("total");
            expect(round.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should allow the first player to hit, stand or doubledown when the first player chooses to bet and does not have a blackjack.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }
            ]);

            round.bet({ amount: 50 });

            expect(round.selectedPlayer.id).toBe(player1.id);
            expect(round.isInProgress()).toBeTruthy();
            expect(round.allowedMoves).toContain(ACTIONS.HIT);
            expect(round.allowedMoves).toContain(ACTIONS.STAND);
            expect(round.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
        })

        it("should not be able to do anything when player chooses to stand (cannot have a blackjack).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }
            ]);
            round.bet({ amount: 50 });
            round.stand();

            expect(round.allowedMoves).toEqual([]);
            expect(round.isInProgress()).toBeFalsy();
        })

        it("should not be able to do anything when player loses (cannot have a blackjack).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' },
                { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ amount: 50 });
            round.hit();

            expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
            expect(round.allowedMoves).toEqual([]);
            expect(round.isInProgress()).toBeFalsy();
        })

        it("should have a winner when dealer busts (dealer cannot have a blackjack).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                { rank: 'J', suit: 'clubs' }, { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ amount: 50 });
            round.stand();

            expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
            expect(round.allowedMoves).toEqual([]);
            expect(round.isInProgress()).toBeFalsy();
        })

        it("should have a tie (blackjack) when dealer has the same score with the player.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ amount: 50 });

            expect(round.players[0].outcome).toBe(OUTCOMES.TIE);
            expect(round.allowedMoves).toEqual([]);
            expect(round.isInProgress()).toBeFalsy();
        })

        it("should have a tie when dealer has the same score with the player.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                { rank: 'Q', suit: 'clubs' }, { rank: '8', suit: 'clubs' }
            ]);

            round.bet({ amount: 50 });
            round.stand();

            expect(round.players[0].outcome).toBe(OUTCOMES.TIE);
            expect(round.allowedMoves).toEqual([]);
            expect(round.isInProgress()).toBeFalsy();
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
            expect(round.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should allow the second player to bet when the first player submited their bet.", () => {
            round = new Round([player1, player2]);

            round.bet({ amount: 50 });

            expect(round.selectedPlayer.id).toBe(player2.id);
            expect(round.allowedMoves).toEqual([ACTIONS.BET]);
        })

        describe('Round with blackjacks', () => {
            it("should allow the second player to play when the first player has a blackjack and the second does not.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });

                expect(round.selectedPlayer.id).toBe(player2.id);
                expect(round.isInProgress()).toBeTruthy();
                expect(round.allowedMoves).toContain(ACTIONS.HIT);
                expect(round.allowedMoves).toContain(ACTIONS.STAND);
                expect(round.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
            })

            it("should not be able to do anything when the second player has a blackjack.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.stand();

                expect(round.allowedMoves).toEqual([]);
                expect(round.isInProgress()).toBeFalsy();
            })

            it("should not be able to do anything when both players have a blackjack.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });

                expect(round.allowedMoves).toEqual([]);
                expect(round.isInProgress()).toBeFalsy();
            })
        })

        describe('Round without blackjacks', () => {
            it("should allow the first player (cannot have a blackjack) to play when the second player submited their bet.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                ]);
                round.bet({ amount: 50 });
                round.bet({ amount: 50 });

                expect(round.selectedPlayer.id).toBe(player1.id);
                expect(round.isInProgress()).toBeTruthy();
                expect(round.allowedMoves).toContain(ACTIONS.HIT);
                expect(round.allowedMoves).toContain(ACTIONS.STAND);
                expect(round.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
            })

            it("should allow the second player to play when the first player busts (cannot have a blackjack).", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: 'Q', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                    { rank: 'Q', suit: 'clubs' },
                    { rank: 'Q', suit: 'clubs' },
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.hit();

                expect(round.selectedPlayer.id).toBe(player2.id);
                expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
                expect(round.players[1].outcome).toBeFalsy();
                expect(round.isInProgress()).toBeTruthy();
                expect(round.allowedMoves).toContain(ACTIONS.HIT);
                expect(round.allowedMoves).toContain(ACTIONS.STAND);
                expect(round.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                expect(round.allowedMoves).toContain(ACTIONS.SPLIT);
            })

            it("should allow the second player to split if the first player has hit even though cards are even.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' },
                    { rank: 'A', suit: 'clubs' }, // player 1 has 21 so, its players' 2 turn
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.hit();

                expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                expect(round.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
            })

            it("should not be able to split after player has hit even though cards are even.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' },
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.hit();

                expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                expect(round.allowedMoves).not.toContain(ACTIONS.DOUBLE_DOWN);
            })

            it("should not be able to do anything when the second player (cannot have a blackjack) chooses to stand.", () => {
                round = new Round([player1, player2]);
                round.gameCards.draw = round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' }
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.stand(); // Cannot stand if player 1 has a blackjack
                round.stand(); // Cannot stand if player 2 has a blackjack

                expect(round.allowedMoves).toEqual([]);
                expect(round.isInProgress()).toBeFalsy();
            })

            it("should not be able to do anything when the second player busts.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                    { rank: 'Q', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: '10', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' },
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.stand();
                round.hit();

                expect(round.players[1].outcome).toBe(OUTCOMES.DEFEAT);
                expect(round.allowedMoves).toEqual([]);
                expect(round.isInProgress()).toBeFalsy();
            })

            it("should have two winners when dealer looses (cannot have a blackjack).", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                    { rank: 'Q', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                ]);

                round.bet({ amount: 50 });
                round.bet({ amount: 50 });
                round.stand();  // Cannot stand if player 1 has a blackjack
                round.stand();  // Cannot stand if player 2 has a blackjack

                expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
                expect(round.players[1].outcome).toBe(OUTCOMES.WIN);
                expect(round.allowedMoves).toEqual([]);
                expect(round.isInProgress()).toBeFalsy();
            })

            describe('double-down', () => {
                it("should have double the amount of the bet when player wins.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' },
                        { rank: '7', suit: 'clubs' },
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });
                    round.doubledown();
                    round.stand();

                    expect(player1.client.totalAmount).toBe(1100);
                    expect(round.allowedMoves).toEqual([]);
                    expect(round.isInProgress()).toBeFalsy();
                })

                it("should lose double the amount of the bet when player loses.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });
                    round.doubledown();
                    round.stand();

                    expect(round.allowedMoves).toEqual([]);
                    expect(player1.client.totalAmount).toBe(900);
                })
            })

            describe('split', () => {
                it("should not be able to split when player has cards with differnent values.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' }
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });

                    expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should be able to split when player has cards with same values. (not aces)", () => { // sometimes fails ??
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                        { rank: '8', suit: 'clubs' }, { rank: '4', suit: 'clubs' },
                        { rank: 'J', suit: 'clubs' },
                        { rank: 'A', suit: 'clubs' },
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });

                    expect(round.allowedMoves).toContain(ACTIONS.SPLIT);
                })

                it("should not be able to split when player has aces.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: 'A', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });

                    expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should contain one more player when user splits.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '8', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: 'J', suit: 'clubs' },
                        { rank: '2', suit: 'clubs' },
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });
                    round.split();

                    expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should be able to split when player has cards with same values. (not aces)", () => { // sometimes fails ??
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '8', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                        { rank: 'J', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                        { rank: '2', suit: 'clubs' },
                    ]);

                    round.bet({ amount: 50 });
                    round.bet({ amount: 50 });
                    round.hit();
                    round.split();

                    expect(round.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })
            })
        })
    })
})