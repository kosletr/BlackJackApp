const logger = require('../config/logger');
const configurations = require("../game/configurations");
const CommandHandler = require('./commandHandler');
const GameError = require('../game/entities/gameError');
const RequestModel = require('./requestModel');
const { sendBadResponse, sendInternalServerErrorResponse, sendOkResponse } = require("./utils");

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
        logger.info("New client connected!");
        const initialState = { allowedMoves: ["registerClient"], configurations };
        sendOkResponse(connection, { message: "Welcome. Please register to play!", state: initialState });
    }

    handleClientMessage(ws, message) {
        let request;
        try {
            request = new RequestModel(message).get();
            const commandHandler = this.commands[request.name].bind(this.commandHandler);
            commandHandler.call(this, ws, request);
        } catch (error) {
            if (error instanceof GameError) {
                logger.warn(error.message);
                return sendBadResponse(ws, request, error.message);
            }
            logger.error(error);
            sendInternalServerErrorResponse(ws);
        }
    }

    handleClientDisconnection(connection) {
        logger.info("Client disconnected!");
        this.commandHandler.handleDisconnection(connection);
    }
}
