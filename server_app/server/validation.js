const { commands, paramConstraints } = require('../game/constants');

module.exports = function validateRequest(data) {
    try {
        const { name, params } = JSON.parse(data);
        const request = { name, params };
        const error = validateCommandName(name) || validateCommandParams(name, params);
        if (error) return { error, request };
        return { request };
    } catch (err) {
        console.log(err);
        return { error: "Cannot parse the request.", request: data };
    }
}

function validateCommandName(commandName) {
    if (!commandName) return "Missing Parameters: name";
    if (!commands.includes(commandName))
        return `Invalid command: ${commandName}`;
}

function validateCommandParams(commandName, commandParams) {
    if (!commandParams) return "Missing Parameters: params";
    const missingParams = new Set(paramConstraints[commandName]);
    Object.keys(commandParams).forEach(p => commandParams[p] && missingParams.delete(p));
    if (missingParams.size > 0)
        return `Missing Parameters from params: ${JSON.stringify([...missingParams])}`;
}