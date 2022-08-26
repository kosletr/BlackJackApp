const config = require('config');
const WebSocket = require('ws');
const { generateUniqueId } = require("./utils");

const Game = require("./entities/game");
const User = require('./entities/user');


const port = process.env.PORT || config.get("port");
const wss = new WebSocket.Server({ port });
const clients = new Map();

const game = new Game();

wss.on('connection', (ws) => {
    const client = { id: generateUniqueId() };
    clients.set(ws, client);
    game.addUser(new User(client.id, "Kostas", 20))
    broadcast(game);

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log(message);
        game.execute(message.command);
        broadcast(game);
    });

    ws.on("close", () => clients.delete(ws));

    function broadcast(data) {
        const clientConnections = [...clients.keys()];
        clientConnections.forEach(client => client.send(JSON.stringify(data)));
    }
});
