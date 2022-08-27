const Round = require("./round");
const Player = require("./player");
const GameState = require("./gameState");
const { generateUniqueId } = require("../utils");

module.exports = class Game {
    constructor() {
        this.id = generateUniqueId();
        this.clients = new Set();
        this.rounds = new Set();
        this.allowedMoves = new Set();
        this.currentRound;
        this.commands = {
            "startGame": this.startGame.bind(this),
            "exitGame": this.exitGame.bind(this),
        };
    }

    validateRoundMoves(clientId, commandName) {
        if (this.currentRound.selectedPlayer.id !== clientId) return "It is not your turn.";
        if (!this.currentRound.allowedMoves.includes(commandName)) return `Command '${commandName}' is not allowed now.`;
    }

    executeCommand(clientId, command) {
        const commandHandler = this.commands[command.name];
        commandHandler.call(this.currentRound, { playerId: clientId, ...command.params });
        this.#informAllClients();
    }

    addClient(client) {
        this.clients.add(client);
        this.allowedMoves.add("startGame");
        this.#informAllClients();
    }

    #informAllClients() {
        const gameState = new GameState(this.allowedMoves, this.currentRound, this.getCurrentPlayers());
        this.clients.forEach(c => c.inform(gameState.getState(c.id)));
    }

    getCurrentPlayers() {
        const players = [];
        this.clients.forEach(c => players.push(new Player(c.id, c.name)));
        return players;
    }

    #updateCommandsForRound() {
        this.commands["bet"] = this.currentRound.bet;
        this.commands["hit"] = this.currentRound.hit;
        this.commands["stand"] = this.currentRound.stand;
    }

    startGame() {
        const players = this.getCurrentPlayers();
        this.currentRound = new Round(players);
        this.rounds.add(this.currentRound);
        this.allowedMoves.delete("startGame");
        this.allowedMoves.add("exitGame");
        this.#updateCommandsForRound();
    }

    exitGame(clientId) {
        this.clients = this.clients.filter(c => c.id !== clientId);
    }

    hasStarted() {
        return this.currentRound && this.currentRound.isActive();
    }
}
