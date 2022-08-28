module.exports = class GameError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
