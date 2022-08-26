const { BEST_SCORE } = require("./constants");

function loseByBust(round) {
    while (round.selectedPlayer.score <= BEST_SCORE)
        round.hit();
}

module.exports = { loseByBust };