const { BEST_SCORE } = require("./constants");

function loseByBust(round) {
    const currentPlayer = round?.selectedPlayer;
    const currentId = currentPlayer.id;
    while (currentPlayer.id = currentId && currentPlayer.score <= BEST_SCORE)
        round.hit();
}

module.exports = { loseByBust };