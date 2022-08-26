const Round = require("./round");
const Player = require("./player");

module.exports = class Game {
    constructor() {
        this.users = [];
        this.rounds = [];
        this.allowedMoves = { game: [], round: [] };
    }

    execute(command) {
        const moves = this.allowedMoves;
        console.log(moves);
        // if (!(command in moves)) throw new Error("Invalid command" + command);
        this[command]();
    }

    addUser(user) {
        this.users.push(user);
        this.allowedMoves.game = ["addUser", "removeUserById"];
        const currentRound = this.currentRound();
        if (!currentRound || !currentRound.isActive())
            this.allowedMoves.game.push("startNextRound");
    }

    removeUserById(id) {
        this.users = this.users.filter(p => p.id !== id);
        if (this.users.length === 0)
            this.allowedMoves = { game: ["addUser"], round: [] };
    }

    startNextRound() {
        const players = this.users.map(u => new Player(u.id, u.name, u.totalAmount));
        this.rounds.push(new Round(players));
        this.allowedMoves = { game: ["addUser", "removeUserById"], round: this.currentRound().allowedMoves };
    }

    // finishRound() {
    //     const currentRound = this.currentRound();
    //     if (!currentRound) return;
    //     if (currentRound.isActive())
    //         throw new Error("Round is not completed.");
    //     const newAmounts = currentRound.players.reduce((acc, p) => ({ ...acc, [p.id]: p.totalAmount }), {});
    //     if (newAmounts)
    //         this.users.forEach(u => u.totalAmount = newAmounts[u.id]);
    // }

    // calculateAllowedMoves() {
    //     if (this.users.length === 0)
    //         return { game: ["calculateAllowedMoves", "addUser"], round: [] };
    //     if (!lastRound || !lastRound.isActive())
    //         return { game: ["calculateAllowedMoves", "addUser", "removeUserById", "startNextRound"], round: [] };
    //     return { game: ["calculateAllowedMoves", "addUser", "removeUserById"], round: lastRound.allowedMoves };
    // }

    currentRound() {
        return this.rounds[this.rounds.length - 1];
    }
}
