const Participant = require("./participant");

module.exports = class Dealer extends Participant {
    constructor() {
        super("Dealer", Number.MAX_SAFE_INTEGER);
    }

    play(game) {
        game.hit();
    }
}
