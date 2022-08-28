const { generateUniqueId } = require("../../utils");
const configurations = require("../configurations");

module.exports = class Client {
    constructor(ws, name) {
        this.id = generateUniqueId();
        this.ws = ws;
        this.name = name;
        this.gameId;
        this.totalAmount = configurations.INITIAL_AMOUNT;
    }

    inform(state) {
        try {
            this.ws.send(JSON.stringify({
                status: 200,
                clientId: this.id,
                configurations,
                state
            }));
        } catch (error) {
            console.error("ERROR", error);
        }
    }
};
