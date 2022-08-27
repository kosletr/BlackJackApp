const config = require('config');
const WebSocket = require('ws');
const { requiredParameters } = require('./entities/constants');
const GameCommands = require('./entities/gameCommands');

const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port });
const gameCommands = new GameCommands();

const requests = {
    registerClient: gameCommands.handleRegisterCommand,
    startGame: gameCommands.handleGameCommand,
    exitGame: gameCommands.handleGameCommand,
    bet: gameCommands.handleGameCommand,
    hit: gameCommands.handleGameCommand,
    stand: gameCommands.handleGameCommand,
}

wss.on('connection', (ws) => {
    handleClientConnection(ws);
    ws.on('message', data => {
        const { error, request } = validateRequest(data);
        if (error) return handleBadRequest(ws, request, error);
        handleRequest(ws, request);
    });
    ws.on("close", () => handleClientDisconnection(ws));
});

function handleClientConnection(ws) {
    console.log("New client connected!");
    webSocketSend(ws, { status: 200, message: "Welcome. Please register to play!" });
}

function handleClientDisconnection(ws) {
    console.log("Client disconnected!");
    gameCommands.removeClient(ws);
}

function validateRequest(data) {
    try {
        const { name, params } = JSON.parse(data);
        const request = { name, params };
        const error = validateCommandName(name) || validateCommandParams(name, params);
        if (error) return { error, request };
        return { request };
    } catch (err) {
        console.log(err);
        return { error: "Cannot parse the request.", request: data };
    }
}

function validateCommandName(commandName) {
    if (!commandName) return "Missing Parameters: name";
    if (!Object.keys(requests).includes(commandName))
        return `Invalid command: ${commandName}`;
}

function validateCommandParams(commandName, commandParams) {
    if (!commandParams) return "Missing Parameters: params";
    const missingParams = new Set(requiredParameters[commandName]);
    Object.keys(commandParams).forEach(p => commandParams[p] && missingParams.delete(p));
    if (missingParams.size > 0)
        return `Missing Parameters from params: ${JSON.stringify([...missingParams])}`;
}

function handleBadRequest(ws, request, error) {
    webSocketSend(ws, { status: 400, message: error, request });
}

function handleRequest(ws, command) {
    const commandHandler = requests[command.name].bind(gameCommands);
    const error = commandHandler(ws, command);
    if (error) handleBadRequest(ws, command, error);
}

function webSocketSend(ws, message) {
    ws.send(JSON.stringify(message));
}
