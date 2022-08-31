const logger = require('../config/logger');
const configurations = require("../game/configurations");
const GameHandler = require('./gameHandler');
const GameError = require('../game/entities/gameError');
const { sendBadResponse, sendInternalServerErrorResponse, sendOkResponse, createRequestModel } = require("./utils");

const commands = {
    registerClient: "handleRegisterCommand",
    startGame: "handleStartGameCommand",
    exitGame: "handleExitGameCommand",
    startRound: "handleGameCommand",
    bet: "handleGameCommand",
    hit: "handleGameCommand",
    stand: "handleGameCommand",
    split: "handleGameCommand",
    doubledown: "handleGameCommand",
}

module.exports = class ConnectionHandler {
    constructor() {
        this.commandHandler = new GameHandler();
    }

    handleClientConnection(connection) {
        logger.info("New client connected!");
        const initialState = { allowedMoves: ["registerClient"], configurations };
        sendOkResponse(connection, { message: "Welcome. Please register to play!", state: initialState });
    }

    handleClientMessage(ws, message) {
        let request;
        try {
            request = createRequestModel(message);
            const command = commands[request.name];
            const commandHandler = this.commandHandler[command].bind(this.commandHandler);
            commandHandler.call(this, ws, request);
        } catch (error) {
            if (error instanceof GameError) {
                logger.warn(error.message);
                return sendBadResponse(ws, error.message, request);
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
