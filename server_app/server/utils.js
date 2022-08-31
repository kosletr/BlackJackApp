const configurations = require("../game/configurations");

function sendOkResponse(connection, data, request) {
    const { id, state, ...others } = data;
    const response = { clientId: id, configurations, state, ...others, request };
    sendToClient(connection, { status: 200, ...response });
}

function sendBadResponse(connection, error, request) {
    sendToClient(connection, { status: 400, message: error, request });
}

function sendInternalServerErrorResponse(connection) {
    sendToClient(connection, { status: 500, message: "Something failed. Please contact the administrator." });
}

function sendToClient(connection, data) {
    connection.send(JSON.stringify(data));
}

module.exports = { sendOkResponse, sendBadResponse, sendInternalServerErrorResponse };
