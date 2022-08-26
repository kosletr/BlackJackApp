const User = require("./user");
const Card = require("./card");

describe('User', () => {
    let user;

    beforeEach(() => user = new User())

    it("should return { 5 } when the sequence is: 5.", () => {
        user.pullACard(new Card("5", "swords"));
        expect(user.possibleScores).toEqual(new Set([5]));
        expect(user.score).toBe(5);
    })

    it("should return { 6, 16 } when the sequence is: 5, A.", () => {
        user.pullACard(new Card("5", "swords"));
        user.pullACard(new Card("A", "cups"));
        expect(user.possibleScores).toEqual(new Set([6, 16]));
        expect(user.score).toBe(16);
    })

    it("should return { 21, 31, 41, 51, 61 } when the sequence is: A, A, A, A, 2, 2, 2, 2, 3, 3, 3.", () => {
        user.pullACard(new Card("A", "swords"));
        user.pullACard(new Card("A", "cups"));
        user.pullACard(new Card("A", "coins"));
        user.pullACard(new Card("A", "clubs"));
        user.pullACard(new Card("2", "swords"));
        user.pullACard(new Card("2", "cups"));
        user.pullACard(new Card("2", "coins"));
        user.pullACard(new Card("2", "clubs"));
        user.pullACard(new Card("3", "swords"));
        user.pullACard(new Card("3", "cups"));
        user.pullACard(new Card("3", "coins"));
        expect(user.possibleScores).toEqual(new Set([21, 31, 41, 51, 61]));
        expect(user.score).toBe(21);
    })

    it("should return { 11, 21 } when the sequence is: A, K.", () => {
        user.pullACard(new Card("A", "swords"));
        user.pullACard(new Card("K", "cups"));
        expect(user.possibleScores).toEqual(new Set([11, 21]));
        expect(user.score).toBe(21);
    })

    it("should return { 11, 21 } when the sequence is: K, A.", () => {
        user.pullACard(new Card("K", "swords"));
        user.pullACard(new Card("A", "cups"));
        expect(user.possibleScores).toEqual(new Set([11, 21]));
        expect(user.score).toBe(21);
    })

    it("should return { 25 } when the sequence is: 5, 10, 10.", () => {
        user.pullACard(new Card("5", "swords"));
        user.pullACard(new Card("10", "cups"));
        user.pullACard(new Card("10", "swords"));
        expect(user.possibleScores).toEqual(new Set([25]));
        expect(user.score).toBe(25);
    })

    it("should return { 19 } when the sequence is: 5, Q, A, 3.", () => {
        user.pullACard(new Card("5", "swords"));
        user.pullACard(new Card("Q", "cups"));
        user.pullACard(new Card("A", "clubs"));
        user.pullACard(new Card("3", "swords"));
        expect(user.possibleScores).toEqual(new Set([19, 29]));
        expect(user.score).toBe(19);
    })


    it("should throw an error when the player has lost and trys to pullACard.", () => {
        user.pullACard(new Card("10", "swords"));
        user.pullACard(new Card("10", "cups"));
        user.pullACard(new Card("5", "swords"));
        expect(() => user.pullACard(new Card("2", "clubs"))).toThrow();
    })
})