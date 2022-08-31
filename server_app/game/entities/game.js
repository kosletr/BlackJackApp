const Round = require("./round");
const Player = require("./player");
const getGameState = require("./gameState");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");
const { ACTIONS, requiredParameters } = require("../constants");
const logger = require("../../config/logger");

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

    startGame() {
        if (this.clients.length === 0) throw new GameError("Cannot start a game without players");
        this.currentRound = new Round(this.#getPlayersFromClients(), this.id);
        this.rounds.push(this.currentRound);
        this.allowedMoves = ["exitGame"];
        this.#updateCommandsForNewRound();
        this.informAllClientsOfTheGame();
    }

    startRound() {
        if (this.clients.length === 0) throw new GameError("Cannot start a game without players");
        this.currentRound = new Round(this.previousPlayers || this.#getPlayersFromClients(), this.id);
        this.rounds.push(this.currentRound);
        this.allowedMoves = ["exitGame"];
        this.#updateCommandsForNewRound();
        this.informAllClientsOfTheGame();
    }

    #updateCommandsForNewRound() {
        this.commands[ACTIONS.BET] = this.currentRound.bet.bind(this.currentRound);
        this.commands[ACTIONS.HIT] = this.currentRound.hit.bind(this.currentRound);
        this.commands[ACTIONS.STAND] = this.currentRound.stand.bind(this.currentRound);
        this.commands[ACTIONS.SPLIT] = this.currentRound.split.bind(this.currentRound);
        this.commands[ACTIONS.DOUBLE_DOWN] = this.currentRound.doubledown.bind(this.currentRound);
    }

    executeCommand(clientId, command) {
        this.#checkIfCommandIsCurrentlyAllowed(command, clientId);
        const commandHandler = this.commands[command.name];
        commandHandler({ clientId, ...command.params });
        if (this.currentRound.isCompleted()) this.finishCurrentRound();
        this.informAllClientsOfTheGame();
    }

    #checkIfCommandIsCurrentlyAllowed(command, clientId) {
        if (Object.keys(requiredParameters.gameCommands).includes(command.name)) {
            if (!this.allowedMoves.includes(command.name))
                throw new GameError(`Command '${command.name}' is not allowed now.`);
        } else {
            if (this.getCurrentClientId() !== clientId)
                throw new GameError("It is not your turn.");
            if (!this.currentRound.allowedMoves.includes(command.name))
                throw new GameError(`Command '${command.name}' is not allowed now.`);
        }
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

    hasStarted() {
        return this.currentRound && !this.currentRound.isCompleted();
    }

    exitGame({ clientId }) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) throw new GameError("Client not found.");
        this.removeClient(client);
        if (this.isCompleted()) this.allowedMoves = ["startGame"];
    }

    isCompleted() {
        return this.clients.length === 0;
    }

    getCurrentClientId() {
        return this.currentRound?.selectedPlayer?.client?.id;
    }

    addClient(client) {
        client.gameId = this.id;
        const foundClient = this.clients.find(c => c.id === client.id);
        if (foundClient) throw new Error("Client already in");
        this.clients.push(client);
        if (!this.allowedMoves.includes("startGame")) this.allowedMoves.push("startGame");
        this.informAllClientsOfTheGame();
    }

    removeClient(client) {
        logger.info(`Removing player with clientId: ${client.id} from game: ${this.id}`);
        client.gameId = null;
        this.currentRound.removePlayerByClientId(client.id);
        this.clients = this.clients.filter(c => c.id !== client.id);
        this.informAllClientsOfTheGame();
    }

    informAllClientsOfTheGame() {
        this.clients.forEach(c => c.inform(getGameState(this, c.id)));
    }
}
