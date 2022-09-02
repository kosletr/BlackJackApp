const { generateUniqueId } = require("../../utils");
const { sendOkResponse } = require("../../server/utils");
const { INITIAL_AMOUNT } = require("../configurations");

module.exports = class Client {
    constructor(connection, name) {
        this.connection = connection;
        this.name = name;
        this.id = generateUniqueId();
        this.totalAmount = INITIAL_AMOUNT;
        this.gameId;
    }

    inform(state) {
        sendOkResponse(this.connection, { id: this.id, state });
    }
};
