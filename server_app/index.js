const config = require('config');
const WebSocket = require('ws');
const logger = require('./config/logger');
const ConnectionsHandler = require("./server/connectionsHandler");
const { sendToClient } = require("./server/utils");

const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port }, () => logger.info(`Listening on port ${port}.`));

const connHandlers = new ConnectionsHandler();

const HEARTBEAT_PERIOD = 2000;

wss.on('connection', (ws) => {
    const id = setInterval(() => sendToClient(ws, { data: "heartbeat" }), HEARTBEAT_PERIOD);
    connHandlers.handleClientConnection(ws);
    ws.on('message', (message) => connHandlers.handleClientMessage(ws, message));
    ws.on("close", () => {
        connHandlers.handleClientDisconnection(ws);
        clearInterval(id);
    });
});
