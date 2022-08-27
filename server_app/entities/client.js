const { generateUniqueId } = require("../utils");
const config = require("./config");

module.exports = class Client {
    constructor(ws, name) {
        this.id = generateUniqueId();
        this.ws = ws;
        this.name = name;
        this.gameId;
    }

    inform(state) {
        try {
            this.ws.send(JSON.stringify({
                status: 200,
                clientId: this.id,
                configuration: config,
                state
            }));
        } catch (error) {
            console.error("ERROR", error);
        }
    }
};
