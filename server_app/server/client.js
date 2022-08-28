const { generateUniqueId } = require("../utils");
const configurations = require("../game/configurations");

module.exports = class Client {
    constructor(connection, name) {
        this.id = generateUniqueId();
        this.connection = connection;
        this.name = name;
        this.gameId;
        this.totalAmount = configurations.INITIAL_AMOUNT;
    }

    inform(state) {
        try {
            this.connection.send(JSON.stringify({
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
