const Game = require("./game");
const Client = require("./client");

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
        const { id: clientId, gameId } = this.clients.get(ws);
        const game = this.games.find(g => g.id === gameId);
        if (game.hasStarted()) {
            const error = game.validateRoundMoves(clientId, command.name);
            if (error) return error;
        } else {
            
        }
        game.executeCommand(clientId, command);
    }

    removeClient(ws) {
        const client = this.clients.get(ws);
        this.clients.delete(client);
    }
}
