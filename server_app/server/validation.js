const GameError = require("../game/entities/gameError");
const { commands, paramConstraints } = require('../game/constants');

// Can also be replaced by Joi.
module.exports = function validateRequest(request) {
    const { name, params } = request;
    const errors = [];
    errors.push(validateCommandName(name));
    errors.push(validateCommandParams(name, params));
    if (errors.some(Boolean)) throw new GameError(errors.join(" "));
}

function validateCommandName(commandName) {
    if (!commandName) return "Missing Parameters: name";
    if (!commands.includes(commandName)) return `Invalid command: ${commandName}`;
}

function validateCommandParams(commandName, commandParams) {
    if (!commandParams) return "Missing Parameters: params";
    const missingParams = new Set(paramConstraints[commandName]);
    Object.keys(commandParams).forEach(p => (commandParams[p] || commandParams[p] === 0) && missingParams.delete(p));
    if (missingParams.size > 0) return `Missing Parameters from params: ${JSON.stringify([...missingParams])}`;
}
