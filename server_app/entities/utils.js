const { BEST_SCORE } = require("./constants");

function loseByTakingTooManyCards(round) {
    while (round.selectedPlayer.score <= BEST_SCORE)
        round.hit();
}

module.exports = { loseByTakingTooManyCards };