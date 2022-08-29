const { BEST_SCORE, OUTCOMES } = require("../game/constants");

function loseByBust(round) {
    const currentId = round?.selectedPlayer?.id;
    while (round?.selectedPlayer?.id === currentId && round?.selectedPlayer?.score <= BEST_SCORE)
        round.hit();
}

module.exports = { loseByBust };