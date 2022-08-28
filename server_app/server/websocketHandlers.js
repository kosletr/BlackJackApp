const GameStatus = require('../game/entities/gameStatus');
const GameCommands = require('../game/entities/gameCommands');

module.exports = class WebSocketHandlers {
    constructor() {
        this.gameCommands = new GameCommands();
        this.requests = {
            registerClient: this.gameCommands.handleRegisterCommand,
            startGame: this.gameCommands.handleGameCommand,
            startRound: this.gameCommands.handleGameCommand,
            exitGame: this.gameCommands.handleGameCommand,
            bet: this.gameCommands.handleGameCommand,
            hit: this.gameCommands.handleGameCommand,
            stand: this.gameCommands.handleGameCommand,
        }
    }

    handleClientConnection(ws) {
        console.log("New client connected!");
        const initialState = new GameStatus(["registerClient"], null, []).getStatus(null);
        webSocketSend(ws, { status: 200, message: "Welcome. Please register to play!", state: initialState });
    }

    handleClientDisconnection(ws) {
        console.log("Client disconnected!");
        this.gameCommands.removeClient(ws);
    }

    handleRequest(ws, command) {
        const commandHandler = this.requests[command.name].bind(this.gameCommands);
        const error = commandHandler.call(this, ws, command);
        if (error) this.sendBadRequest(ws, command, error);
    }

    sendBadRequest(ws, request, error) {
        webSocketSend(ws, { status: 400, message: error, request });
    }

    sendInternalServerError(ws) {
        webSocketSend(ws, { status: 500, message: "Something failed. Please contact the administrator." });
    }
}

function webSocketSend(ws, data) {
    ws.send(JSON.stringify(data));
}
