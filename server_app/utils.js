const configurations = require("./game/configurations");

// UUID v4
function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Modern version of the Fisher–Yates shuffle algorithm
function shuffleArray(array) {
    let j;
    for (let i = array.length - 1; i >= 0; i--) {
        j = Math.floor(Math.random() * i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function sendValidState(connection, data) {
    try {
        const { id, state, ...others } = data;
        connection.send(JSON.stringify({
            status: 200,
            clientId: id,
            configurations,
            state,
            ...others
        }));
    } catch (error) {
        console.error("ERROR", error);
    }
}

module.exports = { generateUniqueId, shuffleArray, sendValidState }
