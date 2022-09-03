const Round = require("./round");
const Player = require("./player");
const getGameState = require("./gameState");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");
const logger = require("../../config/logger");

module.exports = class Game {
    constructor() {
        this.id = generateUniqueId();
        this.clients = [];
        this.rounds = [];
        this.allowedMoves = [];
        this.currentRound;
    }

    startGame() {
        this.#startNewRoundWithClients(this.clients);
    }

    startNextRound() {
        const clientsThatHaveNotExitedTheGame = this.clientsForNextRound?.filter(c => this.clients.includes(c)) || this.clients;
        this.#startNewRoundWithClients(clientsThatHaveNotExitedTheGame);
    }

    #startNewRoundWithClients(clients) {
        const players = this.#createPlayersFromClients(clients);
        if (players.length === 0) throw new GameError("Cannot start a game/round without any clients.");
        this.currentRound = new Round(players, this.id);
        this.rounds.push(this.currentRound);
        this.allowedMoves = ["exitGame"];
        this.informAllClientsOfTheGame();
    }

    #createPlayersFromClients(clients) {
        return clients.map(c => new Player(c));
    }

    executeCommand(clientId, command) {
        this.#checkIfCommandIsCurrentlyAllowed(command, clientId);
        const playerId = this.currentRound?.players?.find(p => p.client.id === clientId)?.id; // used only for betting.
        if (!playerId) throw new Error("Client not in this game.");
        const roundCommand = this.currentRound?.[command.name]?.bind(this.currentRound);
        const gameCommand = this[command.name]?.bind(this);
        const commandHandler = roundCommand || gameCommand;
        commandHandler({ playerId, ...command.params });
        if (this.currentRound.isCompleted()) this.finishCurrentRound();
        this.informAllClientsOfTheGame();
    }

    #checkIfCommandIsCurrentlyAllowed(command, clientId) {
        const isAllowedGameCommand = this.allowedMoves.includes(command.name);
        const isAllowedRoundCommand = this.currentRound?.getAllowedRoundMovesForClient(clientId).includes(command.name);
        if (!isAllowedGameCommand && !isAllowedRoundCommand)
            throw new GameError(`Command '${command.name}' is not allowed now.`);
    }

    finishCurrentRound() {
        this.clientsForNextRound = this.#keepClientsForNextRounds();
        this.allowedMoves = ["startNextRound", "exitGame"];
    }

    #keepClientsForNextRounds() {
        const uniqueClientIDs = new Set(this.currentRound.players.map(p => p.client.id));
        return this.clients.filter(c => uniqueClientIDs.has(c.id));
    }

    hasStarted() {
        return this.currentRound && !this.currentRound.isCompleted();
    }

    exitGame({ clientId }) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) throw new GameError("Client was not found.");
        this.removeClient(client);
        if (this.isCompleted()) this.allowedMoves = ["startGame"];
    }

    isCompleted() {
        return this.clients.length === 0;
    }

    addClient(client) {
        client.gameId = this.id;
        const foundClient = this.clients.find(c => c.id === client.id);
        if (foundClient) throw new Error("Client already in this game.");
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
