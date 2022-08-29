const { generateUniqueId, sendValidState } = require("../utils");
const { INITIAL_AMOUNT } = require("../game/configurations");

module.exports = class Client {
    constructor(connection, name) {
        this.connection = connection;
        this.name = name;
        this.id = generateUniqueId();
        this.totalAmount = INITIAL_AMOUNT;
        this.gameId;
    }

    inform(state) {
        sendValidState(this.connection, { id: this.id, state });
    }
};
