const { DEALER_MIN_STAND_SCORE } = require("../constants");
const Participant = require("./participant");

module.exports = class Dealer extends Participant {
    constructor() {
        super("Dealer", Number.MAX_SAFE_INTEGER);
    }

    play(round) {
        const anyPlayersLeft = round.players.some(p => !p.isBust());
        if (anyPlayersLeft)
            while (this.score < DEALER_MIN_STAND_SCORE)
                round.hit();
        round.stand();
    }
}
