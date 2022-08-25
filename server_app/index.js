const config = require('config');
const WebSocket = require('ws');
const { generateUniqueId } = require("./utils");

const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port });
const clients = new Map();

function generateResponseData() {
    return { message: `Message from server. Clients: ${clients.size}` };
}

wss.on('connection', (ws) => {
    clients.set(ws, { id: generateUniqueId() });

    ws.on('message', (message) => {
        const clientMessage = JSON.parse(message);
        console.log(clientMessage);
        // const responseData = clients.get(ws);

        const serverMessage = JSON.stringify(generateResponseData());
        const clientConnections = [...clients.keys()];
        console.log(clients.values());

        clientConnections.forEach(client => client.send(serverMessage));
    });

    ws.on("close", () => clients.delete(ws));
});
