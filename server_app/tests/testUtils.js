const { BEST_SCORE } = require("../game/constants");

function loseByBust(round) {
    const currentId = round?.selectedPlayer?.id;
    while (round?.selectedPlayer?.id === currentId && round?.selectedPlayer?.score <= BEST_SCORE) {
        if (round?.selectedPlayer?.score === BEST_SCORE) throw new Error("Bad luck! I got 21.");
        if (round?.selectedPlayer?.outcome) return;
        round.hit();
    }
}

module.exports = { loseByBust };
