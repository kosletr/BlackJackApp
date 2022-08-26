const Round = require("./round");
const Player = require("./player");

module.exports = class Game {
    constructor() {
        this.users = [];
        this.rounds = [];
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUserById(id) {
        this.users = this.users.filter(p => p.id !== id);
    }

    startNextRound() {
        const players = this.users.map(u => new Player(u.id, u.name, u.totalAmount));
        this.rounds.push(new Round(players));
    }

    calculateAllowedMoves() {
        if (this.users.length === 0)
            return { game: ["calculateAllowedMoves", "addUser"], round: [] };
        const lastRound = this.currentRound();
        if (!lastRound || lastRound.isCompleted())
            return { game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"], round: [] };
        return { game: ["calculateAllowedMoves", "addUser", "removeUserById"], round: lastRound.calculateAllowedMoves() };
    }

    currentRound() {
        return this.rounds[this.rounds.length - 1];
    }
}
