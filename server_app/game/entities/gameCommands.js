const Game = require("./game");
const Client = require("./client");
const { requiredParameters } = require("../constants");

module.exports = class GameCommands {
    constructor() {
        this.games = [];
        this.clients = new Map();
    }

    handleRegisterCommand(ws, command) {
        if (this.clients.get(ws)) return "Client is registed.";
        const client = new Client(ws, command.params.name);
        this.clients.set(ws, client);
        const game = this.#findOrCreateGame();
        client.gameId = game.id;
        game.addClient(client);
    }

    #findOrCreateGame() {
        const foundGame = this.games.find(g => !g.hasStarted());
        if (foundGame) return foundGame;
        const game = new Game();
        this.games.push(game);
        return game;
    }

    handleGameCommand(ws, command) {
        const client = this.clients.get(ws);
        if (!client) return "Client is not registered.";
        const { id: clientId, gameId } = client;
        const game = this.games.find(g => g.id === gameId);
        const error = Object.keys(requiredParameters.gameCommands).includes(command.name)
            ? game.validateGameMoves(command.name)
            : game.validateRoundMoves(clientId, command.name);
        if (error) return error;
        game.executeCommand(clientId, command);
    }

    removeClient(ws) {
        const clientToDisconnect = this.clients.get(ws);
        for (const game of this.games) {
            for (const client of game.clients) {
                if (client.id === clientToDisconnect.id) {
                    game.clients.delete(client);
                    game.informAllClients();
                }
            }
        }
        this.clients.delete(clientToDisconnect);
    }
}
