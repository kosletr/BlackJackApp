const Client = require("../../game/entities/client");
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

            expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should throw when player tries to bet a wager less than the minimum bet.", () => {

            expect(() => round.bet({ playerId: player1.id, amount: MIN_BET - 1 })).toThrow("min");
            expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should throw when player tries to bet a wager greater than their total.", () => {

            expect(() => round.bet({ playerId: player1.id, amount: INITIAL_AMOUNT + 1 })).toThrow("total");
            expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should allow the first player to hit, stand or doubledown when the first player chooses to bet and does not have a blackjack.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });

            expect(round.selectedParticipant.id).toBe(player1.id);
            expect(round.isCompleted()).toBeFalsy();
            expect(player1.allowedMoves).toContain(ACTIONS.HIT);
            expect(player1.allowedMoves).toContain(ACTIONS.STAND);
            expect(player1.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
        })

        it("should not be able to do anything when player chooses to stand (no blackjack).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' }
            ]);
            round.bet({ playerId: player1.id, amount: 50 });
            round.stand();

            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should not be able to do anything when player loses (no blackjack).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                { rank: '10', suit: 'clubs' },
                { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });
            round.hit();

            expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should have a winner when dealer busts.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                { rank: 'J', suit: 'clubs' }, { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });
            round.stand();

            expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should have a tie when both the dealer and the player have a blackjack.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });

            expect(round.players[0].outcome).toBe(OUTCOMES.TIE);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should be a win when the the player has a blackjack and the dealer gets 21.", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                { rank: 'A', suit: 'clubs' }, { rank: '2', suit: 'clubs' }, { rank: '8', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });

            expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should be a defeat when the the player has a 21 and the dealer gets a blackjack.", () => {
            round.gameCards = drawCustomCards([
                { rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                { rank: '2', suit: 'clubs' },
                { rank: '8', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });
            round.hit();

            expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        it("should have a tie when dealer has the same score with the player (except blackjacks/21s).", () => {
            round.gameCards = drawCustomCards([
                { rank: '10', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                { rank: '8', suit: 'clubs' }, { rank: '8', suit: 'clubs' }
            ]);

            round.bet({ playerId: player1.id, amount: 50 });
            round.stand();

            expect(round.players[0].outcome).toBe(OUTCOMES.TIE);
            expect(player1.allowedMoves).toEqual([]);
            expect(round.isCompleted()).toBeTruthy();
        })

        describe('double-bet', () => {
            it("should be able to double-bet when .", () => {
                round = new Round([player1]);

                round.bet({ playerId: player1.id, amount: 499 });

                expect(player1.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
            })
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

            expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
            expect(player2.allowedMoves).toEqual([ACTIONS.BET]);
        })

        it("should allow the second player to bet when the first player submited their bet.", () => {
            round = new Round([player1, player2]);

            round.bet({ playerId: player1.id, amount: 50 });

            expect(player1.allowedMoves).toEqual([]);
            expect(player2.allowedMoves).toEqual([ACTIONS.BET]);
        })

        describe('Round with blackjacks', () => {
            it("should allow the second player to play when the first player has a blackjack and the second does not.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' }, { rank: '2', suit: 'clubs' }
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });

                expect(round.selectedParticipant.id).toBe(player2.id);
                expect(round.isCompleted()).toBeFalsy();
                expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                expect(player2.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                expect(player1.allowedMoves).toEqual([]);
            })

            it("should not be able to do anything when the second player has a blackjack.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '8', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
                ]);

                round.bet({ playerId: player1.id, amount: 50 });
                round.bet({ playerId: player2.id, amount: 50 });
                round.stand();

                expect(player2.outcome).toBe(OUTCOMES.WIN);
                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })

            it("should not be able to do anything when both players have a blackjack and dealer does not.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }, { rank: '3', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });

                expect(player1.outcome).toBe(OUTCOMES.WIN);
                expect(player2.outcome).toBe(OUTCOMES.WIN);
                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })

            it("should not be able to do anything when both players and dealers have a blackjack.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: 'A', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }, { rank: 'K', suit: 'clubs' }
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });

                expect(player1.outcome).toBe(OUTCOMES.TIE);
                expect(player2.outcome).toBe(OUTCOMES.TIE);
                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })
        })

        describe('Round without blackjacks', () => {
            it("should allow the first player (cannot have a blackjack) to play when the second player submited their bet.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' }, { rank: 'A', suit: 'clubs' }, { rank: 'A', suit: 'clubs' },
                ]);
                round.bet({ playerId: player1.id, amount: 50 });
                round.bet({ playerId: player2.id, amount: 50 });

                expect(round.selectedParticipant.id).toBe(player1.id);
                expect(round.isCompleted()).toBeFalsy();
                expect(player1.allowedMoves).toContain(ACTIONS.HIT);
                expect(player1.allowedMoves).toContain(ACTIONS.STAND);
                expect(player1.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                expect(player2.allowedMoves).toEqual([]);
            })

            it("should allow the second player to play when the first player busts (cannot have a blackjack).", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });
                round.hit();

                expect(round.selectedParticipant.id).toBe(player2.id);
                expect(round.players[0].outcome).toBe(OUTCOMES.DEFEAT);
                expect(round.players[1].outcome).toBeFalsy();
                expect(round.isCompleted()).toBeFalsy();
                expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                expect(player2.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                expect(player2.allowedMoves).toContain(ACTIONS.SPLIT);
                expect(player1.allowedMoves).toEqual([]);
            })

            it("should not allow the second player to split when the second player does not have enough money.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' },
                ]);

                round.bet({ playerId: player1.id, amount: 50 });
                round.bet({ playerId: player2.id, amount: 600 });
                round.stand();

                expect(round.selectedParticipant.id).toBe(player2.id);
                expect(round.isCompleted()).toBeFalsy();
                expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                expect(player2.allowedMoves).not.toContain(ACTIONS.DOUBLE_DOWN);
                expect(player2.allowedMoves).not.toContain(ACTIONS.SPLIT);
                expect(player1.allowedMoves).toEqual([]);
            })

            it("should allow the second player to play if the first player has hit and received 21.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '5', suit: 'clubs' }, { rank: 'J', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    { rank: 'A', suit: 'clubs' }
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });
                round.hit();

                expect(player2.allowedMoves).not.toContain(ACTIONS.SPLIT);
                expect(player2.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                expect(player1.allowedMoves).toEqual([]);
            })

            it("should not be able to split after player has hit.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '5', suit: 'clubs' }, { rank: 'J', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' },
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });
                round.hit();

                expect(player1.allowedMoves).not.toContain(ACTIONS.SPLIT);
                expect(player1.allowedMoves).not.toContain(ACTIONS.DOUBLE_DOWN);
            })

            it("should not be able to do anything when the second player (no blackjack) chooses to stand.", () => {
                round = new Round([player1, player2]);
                round.gameCards.draw = round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                ]);

                round.bet({ playerId: player1.id, amount: 50 });
                round.bet({ playerId: player2.id, amount: 50 });
                round.stand(); // Cannot stand if player 1 has a blackjack
                round.stand(); // Cannot stand if player 2 has a blackjack

                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })

            it("should not be able to do anything when the second player busts.", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    { rank: 'K', suit: 'clubs' },
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });
                round.stand();
                round.hit();

                expect(round.players[1].outcome).toBe(OUTCOMES.DEFEAT);
                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })

            it("should have two winners when dealer looses (cannot have a blackjack).", () => {
                round = new Round([player1, player2]);
                round.gameCards = drawCustomCards([
                    { rank: '10', suit: 'clubs' }, { rank: 'Q', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                    { rank: 'J', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                ]);

                round.bet({ playerId: player2.id, amount: 50 });
                round.bet({ playerId: player1.id, amount: 50 });
                round.stand();  // Cannot stand if player 1 has a blackjack
                round.stand();  // Cannot stand if player 2 has a blackjack

                expect(round.players[0].outcome).toBe(OUTCOMES.WIN);
                expect(round.players[1].outcome).toBe(OUTCOMES.WIN);
                expect(player1.allowedMoves).toEqual([]);
                expect(player2.allowedMoves).toEqual([]);
                expect(round.isCompleted()).toBeTruthy();
            })

            describe('double-down', () => {
                it("should have double the amount of the bet when player wins.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '7', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.doubledown();
                    round.stand();

                    expect(player1.allowedMoves).toEqual([]);
                    expect(player2.allowedMoves).toEqual([]);
                    expect(round.isCompleted()).toBeTruthy();
                    expect(player1.client.totalAmount).toBe(1100);
                })

                it("should lose double the amount of the bet when player loses.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.doubledown();
                    round.stand();

                    expect(player1.allowedMoves).toEqual([]);
                    expect(player2.allowedMoves).toEqual([]);
                    expect(player1.client.totalAmount).toBe(900);
                })
            })

            describe('split', () => {
                it("should not be able to split when player has cards with differnent values.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });

                    expect(player1.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should be able to split when player has cards with same values. (not aces)", () => { // sometimes fails ??
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '4', suit: 'clubs' },
                        { rank: 'A', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });

                    expect(player1.allowedMoves).toContain(ACTIONS.SPLIT);
                })

                it("should not be able to split when the first player has aces.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: 'A', suit: 'clubs' }, { rank: '5', suit: 'clubs' }, { rank: '3', suit: 'clubs' },
                        { rank: 'A', suit: 'clubs' }, { rank: '7', suit: 'clubs' }
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });

                    expect(round.selectedParticipant.allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should contain one more player when user splits.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '8', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '8', suit: 'clubs' }, { rank: '5', suit: 'clubs' },
                        { rank: '2', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.split();

                    expect(round.players[0].allowedMoves).not.toContain(ACTIONS.SPLIT);
                    expect(round.players[1].allowedMoves).not.toContain(ACTIONS.SPLIT);
                })

                it("should be able to split when player has cards with same values. (not aces)", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.hit();
                    round.split();

                    expect(round.players[1].allowedMoves).not.toContain(ACTIONS.SPLIT);
                    expect(round.players[2].allowedMoves).not.toContain(ACTIONS.SPLIT);
                })


                it("should test this case", () => {
                    const client1 = new Client(null, "Kostas");
                    player1 = new Player(client1);
                    const client2 = new Client(null, "G");
                    player2 = new Player(client2);
                    const client3 = new Client(null, "Nick the greek");
                    let player3 = new Player(client3);
                    const client4 = new Client(null, "Thano");
                    let player4 = new Player(client4);

                    round = new Round([player1, player2, player3, player4]);
                    round.gameCards = drawCustomCards([
                        { rank: '2', suit: 'clubs' }, { rank: '9', suit: 'clubs' }, { rank: 'J', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                        { rank: 'Q', suit: 'clubs' }, { rank: '10', suit: 'clubs' }, { rank: 'J', suit: 'clubs' }, { rank: '10', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' },
                        { rank: '4', suit: 'clubs' }, { rank: '2', suit: 'clubs' }, { rank: 'K', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player4.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player3.id, amount: 50 });
                    round.hit();
                    round.stand();
                    round.split();

                    expect(round.players).toHaveLength(5);
                    expect(round.selectedParticipant.client).toBe(client3);
                })
            })

            describe('removePlayerByClientId', () => {
                it("should be player2's turn when player1 exits the game before beting.", () => {
                    round = new Round([player1, player2]);
                    round.removePlayerByClientId(player1.client.id);

                    expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
                    expect(player2.allowedMoves).toEqual([ACTIONS.BET]);
                })

                it("should be player2's turn when player1 exits the game before beting.", () => {
                    round = new Round([player1, player2]);
                    round.removePlayerByClientId(player2.client.id);

                    expect(player1.allowedMoves).toEqual([ACTIONS.BET]);
                    expect(player2.allowedMoves).toEqual([ACTIONS.BET]);
                })

                it("should be player1's (no blackjack) turn when player2 exits the game before beting.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.removePlayerByClientId(player2.client.id);

                    expect(player1.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player1.allowedMoves).toContain(ACTIONS.STAND);
                    expect(player1.allowedMoves).toContain(ACTIONS.DOUBLE_DOWN);
                })

                it("should be player2's turn when player1 exits the game after beting.", () => {
                    round = new Round([player1, player2]);
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.removePlayerByClientId(player1.client.id);

                    expect(player2.allowedMoves).toEqual([ACTIONS.BET]);
                })

                it("should be player2 turn when player1 exits the game after both bet.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.removePlayerByClientId(player1.client.id);

                    expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                    expect(player1.allowedMoves).toEqual([]);
                    expect(round.selectedParticipant).toBe(player2);
                })

                it("should be player1 turn when player2 exits the game after beting.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: 'J', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.removePlayerByClientId(player2.client.id);

                    expect(player1.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player1.allowedMoves).toContain(ACTIONS.STAND);
                    expect(round.selectedParticipant).toBe(player1);
                })

                it("should be a win for player1 when player1 has a blackjack and player2 exits the game after beting is done.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                        { rank: 'A', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.removePlayerByClientId(player2.client.id);

                    expect(player1.allowedMoves).toEqual([]);
                    expect(round.selectedParticipant).toBe(null);
                })


                it("should ... after hit.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '4', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                        { rank: '5', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.hit();
                    round.removePlayerByClientId(player1.client.id);

                    expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                    expect(round.selectedParticipant).toBe(player2);
                })

                it("should ... after split.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.split();
                    round.removePlayerByClientId(player1.client.id);

                    expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                    expect(player2.allowedMoves).toContain(ACTIONS.SPLIT);
                    expect(round.selectedParticipant).toBe(player2);
                })

                it("should ... after split.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player2.id, amount: 50 });
                    round.bet({ playerId: player1.id, amount: 50 });
                    round.split();
                    round.removePlayerByClientId(player2.client.id);

                    expect(player1.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player1.allowedMoves).toContain(ACTIONS.STAND);
                    expect(round.selectedParticipant.client.id).toBe(player1.client.id);
                })

                it("should ... after complex split.", () => {
                    round = new Round([player1, player2]);
                    round.gameCards = drawCustomCards([
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
                        { rank: '10', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
                        { rank: 'A', suit: 'clubs' },
                        { rank: '7', suit: 'clubs' },
                    ]);

                    round.bet({ playerId: player1.id, amount: 50 });
                    round.bet({ playerId: player2.id, amount: 50 });
                    round.split();
                    round.hit();
                    round.hit();
                    round.stand();
                    round.split();
                    round.removePlayerByClientId(player1.client.id);

                    expect(player2.allowedMoves).toContain(ACTIONS.HIT);
                    expect(player2.allowedMoves).toContain(ACTIONS.STAND);
                    expect(round.selectedParticipant.client.id).toBe(player2.client.id);
                })

            })
        })
    })
})
