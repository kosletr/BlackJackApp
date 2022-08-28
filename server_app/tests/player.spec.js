const Player = require("../game/entities/player");
const Card = require("../game/entities/card");
const { generateUniqueId } = require("../utils");

describe('Player', () => {
    let player;

    beforeEach(() => player = new Player(generateUniqueId(), "Kostas", 100))

    it("should return { 5 } when the sequence is: 5.", () => {
        player.pullACard(new Card("5", "swords"));
        expect(player.possibleScores).toEqual(new Set([5]));
        expect(player.score).toBe(5);
    })

    it("should return { 6, 16 } when the sequence is: 5, A.", () => {
        player.pullACard(new Card("5", "swords"));
        player.pullACard(new Card("A", "cups"));
        expect(player.possibleScores).toEqual(new Set([6, 16]));
        expect(player.score).toBe(16);
    })

    it("should return { 21, 31, 41, 51, 61 } when the sequence is: A, A, A, A, 2, 2, 2, 2, 3, 3, 3.", () => {
        player.pullACard(new Card("A", "swords"));
        player.pullACard(new Card("A", "cups"));
        player.pullACard(new Card("A", "coins"));
        player.pullACard(new Card("A", "clubs"));
        player.pullACard(new Card("2", "swords"));
        player.pullACard(new Card("2", "cups"));
        player.pullACard(new Card("2", "coins"));
        player.pullACard(new Card("2", "clubs"));
        player.pullACard(new Card("3", "swords"));
        player.pullACard(new Card("3", "cups"));
        player.pullACard(new Card("3", "coins"));
        expect(player.possibleScores).toEqual(new Set([21, 31, 41, 51, 61]));
        expect(player.score).toBe(21);
    })

    it("should return { 11, 21 } when the sequence is: A, K.", () => {
        player.pullACard(new Card("A", "swords"));
        player.pullACard(new Card("K", "cups"));
        expect(player.possibleScores).toEqual(new Set([11, 21]));
        expect(player.score).toBe(21);
    })

    it("should return { 11, 21 } when the sequence is: K, A.", () => {
        player.pullACard(new Card("K", "swords"));
        player.pullACard(new Card("A", "cups"));
        expect(player.possibleScores).toEqual(new Set([11, 21]));
        expect(player.score).toBe(21);
    })

    it("should return { 25 } when the sequence is: 5, 10, 10.", () => {
        player.pullACard(new Card("5", "swords"));
        player.pullACard(new Card("10", "cups"));
        player.pullACard(new Card("10", "swords"));
        expect(player.possibleScores).toEqual(new Set([25]));
        expect(player.score).toBe(25);
    })

    it("should return { 19 } when the sequence is: 5, Q, A, 3.", () => {
        player.pullACard(new Card("5", "swords"));
        player.pullACard(new Card("Q", "cups"));
        player.pullACard(new Card("A", "clubs"));
        player.pullACard(new Card("3", "swords"));
        expect(player.possibleScores).toEqual(new Set([19, 29]));
        expect(player.score).toBe(19);
    })

    it("should return { 16 } when the sequence is: 2, 3, 4, 7.", () => {
        player.pullACard(new Card("2", "swords"));
        player.pullACard(new Card("3", "cups"));
        player.pullACard(new Card("4", "clubs"));
        player.pullACard(new Card("7", "swords"));
        expect(player.possibleScores).toEqual(new Set([16]));
        expect(player.score).toBe(16);
    })

    it("should throw an error when the player has lost and trys to pullACard.", () => {
        player.pullACard(new Card("10", "swords"));
        player.pullACard(new Card("10", "cups"));
        player.pullACard(new Card("5", "swords"));
        expect(() => player.pullACard(new Card("2", "clubs"))).toThrow();
    })
})