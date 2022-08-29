const CommandHandler = require('./commandHandler');
const configurations = require("../game/configurations");

module.exports = class ConnectionHandler {
    constructor() {
        this.commandHandler = new CommandHandler();
        this.commands = {
            registerClient: this.commandHandler.handleRegisterCommand,
            startGame: this.commandHandler.handleStartGameCommand,
            exitGame: this.commandHandler.handleExitGameCommand,
            startRound: this.commandHandler.handleGameCommand,
            bet: this.commandHandler.handleGameCommand,
            hit: this.commandHandler.handleGameCommand,
            stand: this.commandHandler.handleGameCommand,
            split: this.commandHandler.handleGameCommand,
            doubledown: this.commandHandler.handleGameCommand,
        }
    }

    handleClientConnection(connection) {
        console.log("New client connected!");
        const initialState = { allowedMoves: ["registerClient"], configurations };
        sendToClient(connection, { status: 200, message: "Welcome. Please register to play!", state: initialState });
    }

    handleClientDisconnection(connection) {
        console.log("Client disconnected!");
        this.commandHandler.handleDisconnection(connection);
    }

    handleRequest(connection, command) {
        const commandHandler = this.commands[command.name].bind(this.commandHandler);
        const error = commandHandler.call(this, connection, command);
        if (error) this.sendBadRequest(connection, command, error);
    }

    sendBadRequest(connection, request, error) {
        sendToClient(connection, { status: 400, message: error, request });
    }

    sendInternalServerError(connection) {
        sendToClient(connection, { status: 500, message: "Something failed. Please contact the administrator." });
    }
}

function sendToClient(connection, data) {
    connection.send(JSON.stringify(data));
}
