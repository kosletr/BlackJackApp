const Participant = require("./participant");

module.exports = class Dealer extends Participant {
    constructor(id) {
        super(id, "Dealer", Number.MAX_SAFE_INTEGER);
    }

    play(round) {
        round.hit();
    }
}
