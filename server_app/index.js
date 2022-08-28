const config = require('config');
const WebSocket = require('ws');
const WebsocketHandlers = require("./server/websocketHandlers");
const validateRequest = require('./server/validation');


const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port });
const wsHandlers = new WebsocketHandlers();

wss.on('connection', (ws) => {
    wsHandlers.handleClientConnection(ws);
    ws.on('message', data => {
        try {
            const { error, request } = validateRequest(data);
            if (error)
                return wsHandlers.sendBadRequest(ws, request, error);
            return wsHandlers.handleRequest(ws, request);
        } catch (err) {
            console.error(err);
            if (err.message.startsWith("Game:"))
                return wsHandlers.sendBadRequest(ws, null, err.message);
            return wsHandlers.sendInternalServerError(ws);
        }
    });
    ws.on("close", () => wsHandlers.handleClientDisconnection(ws));
});
