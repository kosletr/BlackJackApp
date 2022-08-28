const config = require('config');
const WebSocket = require('ws');
const ConnectionHandler = require("./server/connectionHandler");
const GameError = require('./game/entities/gameError');
const validateRequest = require('./server/validation');

const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port });
const connHandlers = new ConnectionHandler();


wss.on('connection', (ws) => {
    connHandlers.handleClientConnection(ws);
    ws.on('message', data => {
        try {
            const { error, request } = validateRequest(data);
            if (error)
                return connHandlers.sendBadRequest(ws, request, error);
            return connHandlers.handleRequest(ws, request);
        } catch (err) {
            console.error(err);
            if (err instanceof GameError)
                return connHandlers.sendBadRequest(ws, null, err.message);
            return connHandlers.sendInternalServerError(ws);
        }
    });
    ws.on("close", () => connHandlers.handleClientDisconnection(ws));
});
