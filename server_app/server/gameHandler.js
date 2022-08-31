const logger = require("../config/logger");
const Game = require("../game/entities/game");
const GameError = require("../game/entities/gameError");
const Client = require("./client");
const { sendOkResponse } = require("./utils");

module.exports = class GameHandler {
    constructor() {
        this.games = [];
        this.clientsMap = new Map();
    }

    handleRegisterCommand(connection, command) {
        if (this.clientsMap.get(connection)) throw new GameError("Client is already registed.");
        const client = new Client(connection, command.params.name);
        this.clientsMap.set(connection, client);
        sendOkResponse(connection, { id: client.id, state: { allowedMoves: ["startGame"] }, request: command });
    }

    handleDisconnection(connection) {
        const clientToDisconnect = this.clientsMap.get(connection);
        if (!clientToDisconnect) logger.error("Client not found.");
        if (clientToDisconnect?.gameId) this.#findGameByClientAndExit(clientToDisconnect);
        this.clientsMap.delete(connection);
    }

    #findGameByClientAndExit({ id: clientId, gameId }) {
        const game = this.findGameById(gameId);
        if (!game) throw new Error("Game does not exist.");
        game.exitGame({ clientId });
    }

    findGameById(gameId) {
        return this.games.find(g => g.id === gameId);
    }

    handleStartGameCommand() {
        let game;
        for (const client of this.clientsMap.values())
            if (!client.gameId) game = this.#addClientToGame(client);
        game.startGame();
    }

    handleExitGameCommand(connection) {
        const client = this.clientsMap.get(connection);
        this.#findGameByClientAndExit(client);
        sendOkResponse(connection, { id: client.id, state: { allowedMoves: ["startGame"] } });
    }

    handleGameCommand(connection, command) {
        const client = this.clientsMap.get(connection);
        if (!client) throw new GameError("Client is not registered.");
        const { id: clientId, gameId } = client;
        const game = this.games.find(g => g.id === gameId);
        if (!game) throw new Error("Game does not exist.");
        game.executeCommand(clientId, command);
    }


    #addClientToGame(client) {
        const game = this.#findOrCreateGame();
        game.addClient(client);
        return game;
    }

    #findOrCreateGame() {
        const foundGame = this.games.find(g => !g.hasStarted());
        if (foundGame) return foundGame;
        const game = new Game();
        this.games.push(game);
        return game;
    }
}
