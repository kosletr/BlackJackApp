const Round = require("./round");
const Player = require("./player");
const GameState = require("./gameStatus");
const { generateUniqueId } = require("../../utils");
const { MIN_BET } = require("../configurations");

module.exports = class Game {
    constructor() {
        this.id = generateUniqueId();
        this.clients = new Set();
        this.rounds = new Set();
        this.allowedMoves = new Set();
        this.currentRound;
        this.commands = {
            "startGame": this.startGame.bind(this),
            "startRound": this.startRound.bind(this),
            "exitGame": this.exitGame.bind(this),
        };
    }

    startGame() {
        const players = this.getCurrentPlayers();
        this.startRound({ players });
    }

    startRound({ players }) {
        this.currentRound = new Round(players || this.getCurrentPlayers());
        this.currentRound.players.forEach(p => p.bet(MIN_BET));
        this.rounds.add(this.currentRound);
        this.allowedMoves.clear();
        this.allowedMoves.add("exitGame");
        this.#updateCommandsForRound();
    }

    getCurrentPlayers() {
        const players = [];
        this.clients.forEach(c => players.push(new Player(c)));
        return players;
    }

    #updateCommandsForRound() {
        this.commands["bet"] = this.currentRound.bet.bind(this.currentRound);
        this.commands["hit"] = this.currentRound.hit.bind(this.currentRound);
        this.commands["stand"] = this.currentRound.stand.bind(this.currentRound);
    }

    executeCommand(clientId, command) {
        const commandHandler = this.commands[command.name];
        commandHandler({ playerId: clientId, ...command.params });
        const shouldStartNextRound = !this.currentRound.isActive();
        if (shouldStartNextRound) this.allowedMoves.add("startRound");
        this.informAllClients();
    }

    informAllClients() {
        const gameState = new GameState(this.allowedMoves, this.currentRound, this.getCurrentPlayers());
        this.clients.forEach(c => c.inform(gameState.getStatus(c.id)));
    }

    hasStarted() {
        return this.currentRound && this.currentRound.isActive();
    }

    exitGame({ clientId }) {
        for (const c of this.clients)
            if (c.id === clientId)
                this.clients.delete(c);
        this.allowedMoves.clear();
        this.allowedMoves.add("startGame");
    }

    validateRoundMoves(clientId, commandName) {
        if (this.currentRound.selectedPlayer.id !== clientId) return "It is not your turn.";
        if (!this.currentRound.allowedMoves.includes(commandName)) return `Command '${commandName}' is not allowed now.`;
    }

    validateGameMoves(commandName) {
        if (!this.allowedMoves.has(commandName)) return `Command '${commandName}' is not allowed now.`;
    }

    addClient(client) {
        this.clients.add(client);
        this.allowedMoves.add("startGame");
        this.informAllClients();
    }
}
