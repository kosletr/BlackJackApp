const Game = require("../game/entities/game");
const Client = require("./client");
const { requiredParameters } = require("../game/constants");
const { sendOkResponse } = require("./utils");

module.exports = class CommandHandler {
    constructor() {
        this.games = [];
        this.clientsMap = new Map();
    }

    handleRegisterCommand(connection, command) {
        if (this.clientsMap.get(connection)) return "Client is registed.";
        const client = new Client(connection, command.params.name);
        this.clientsMap.set(connection, client);
        sendOkResponse(connection, { id: client.id, state: { allowedMoves: ["startGame"] } });
    }

    handleDisconnection(connection) {
        const clientToDisconnect = this.clientsMap.get(connection);
        if (clientToDisconnect?.gameId)
            this.#findGameByClientAndExit(clientToDisconnect);
        this.clientsMap.delete(connection);
    }

    handleStartGameCommand() {
        let game;
        for (const client of this.clientsMap.values())
            if (!client.gameId) game = this.#addClientToGame(client);
        game.startRound();
    }

    handleExitGameCommand(connection) {
        const client = this.clientsMap.get(connection);
        const game = this.#findGameByClientAndExit(client);
        sendOkResponse(connection, { id: client.id, state: { allowedMoves: game.allowedMoves } });
    }

    handleGameCommand(connection, command) {
        const client = this.clientsMap.get(connection);
        if (!client) return "Client is not registered.";
        const { id: clientId, gameId } = client;
        const game = this.games.find(g => g.id === gameId);
        if (!game) throw new Error("Game does not exist.");
        const error = Object.keys(requiredParameters.gameCommands).includes(command.name)
            ? game.validateGameMoves(command.name)
            : game.validateRoundMoves(clientId, command.name);
        if (error) return error;
        game.executeCommand(clientId, command);
    }

    #findGameByClientAndExit(client) {
        if (!client) return "Client not found.";
        const { id: clientId, gameId } = client;
        const game = this.games.find(g => g.id === gameId);
        if (!game) throw new Error("Game does not exist.");
        game.exitGame({ clientId });
        return game;
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
