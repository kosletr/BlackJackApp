const Round = require("./round");
const Player = require("./player");
const getGameState = require("./gameState");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");
const { ACTIONS } = require("../constants");

module.exports = class Game {
    constructor() {
        this.id = generateUniqueId();
        this.clients = [];
        this.rounds = [];
        this.allowedMoves = [];
        this.currentRound;
        this.commands = {
            "startRound": this.startRound.bind(this),
            "exitGame": this.exitGame.bind(this),
        };
    }

    #getPlayersFromClients() {
        return this.clients.map(c => new Player(c));
    }

    startRound() {
        if (this.clients.length === 0) throw new GameError("Cannot start a game without players");
        this.currentRound = new Round(this.previousPlayers || this.#getPlayersFromClients(), this.id);
        this.rounds.push(this.currentRound);
        this.allowedMoves = ["exitGame"];
        this.#updateCommandsForNewRound();
        this.informAllClients();
    }

    #updateCommandsForNewRound() {
        this.commands[ACTIONS.BET] = this.currentRound.bet.bind(this.currentRound);
        this.commands[ACTIONS.HIT] = this.currentRound.hit.bind(this.currentRound);
        this.commands[ACTIONS.STAND] = this.currentRound.stand.bind(this.currentRound);
        this.commands[ACTIONS.SPLIT] = this.currentRound.split.bind(this.currentRound);
        this.commands[ACTIONS.DOUBLE_DOWN] = this.currentRound.doubledown.bind(this.currentRound);
    }

    executeCommand(clientId, command) {
        const commandHandler = this.commands[command.name];
        commandHandler({ clientId, ...command.params });
        if (this.currentRound.isCompleted()) this.finishCurrentRound();
        this.informAllClients();
    }

    finishCurrentRound() {
        const playersForNextRounds = this.#keepPlayersForNextRounds();
        this.previousPlayers = playersForNextRounds.map(p => p.clone());
        this.allowedMoves = ["startRound", "exitGame"];
    }

    #keepPlayersForNextRounds() {
        const uniquePlayerIDs = new Set();
        for (const player of this.currentRound.players)
            if (!uniquePlayerIDs.has(player.client.id)) uniquePlayerIDs.add(player.client.id);
            else player.id = null;
        return this.currentRound.players.filter(p => p.id);
    }

    informAllClients() {
        for (const client of this.clients) {
            const gameState = getGameState(this, client.id);
            client.inform(gameState);
        }
    }

    hasStarted() {
        return this.currentRound?.isInProgress();
    }

    exitGame({ clientId }) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) throw new GameError("Client not found.");
        this.allowedMoves = ["startGame"];
        this.removeClient(client);
    }

    validateRoundMoves(clientId, commandName) {
        if (this.getCurrentClientId() !== clientId) return "It is not your turn.";
        if (!this.currentRound.allowedMoves.includes(commandName)) return `Command '${commandName}' is not allowed now.`;
    }

    validateGameMoves(commandName) {
        if (!this.allowedMoves.includes(commandName)) return `Command '${commandName}' is not allowed now.`;
    }

    getAllowedMoves(clientId) {
        const roundMoves = this.currentRound?.allowedMoves;
        const gameMoves = [...this.allowedMoves];
        if (roundMoves && clientId === this.getCurrentClientId()) gameMoves.push(...roundMoves);
        return gameMoves;
    }

    getCurrentClientId() {
        return this.currentRound?.selectedPlayer?.client?.id;
    }

    addClient(client) {
        this.allowedMoves = ["startGame"];
        client.gameId = this.id;
        this.clients.push(client);
        this.informAllClients();
    }

    removeClient(client) {
        client.gameId = null;
        this.clients = this.clients.filter(c => c.id !== client.id);
        if (!this.currentRound.isCompleted()) this.currentRound.removeClientById(client.id);
        this.informAllClients();
    }
}
