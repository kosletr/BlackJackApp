module.exports = class GameState {
    constructor(allowedMoves, round, players) {
        this.allowedMoves = allowedMoves;
        this.round = round;
        this.players = players;
    }

    getState(clientId) {
        return {
            allowedMoves: [...this.allowedMoves, ...getAllowedMovesForRound(this.round, clientId)],
            dealer: getDealerState(this.round?.dealer),
            players: getPlayersState(this.round?.players || this.players),
            selectedPlayerId: this.round?.selectedPlayer.id,
        }
    }
}

function getAllowedMovesForRound(round, clientId) {
    if (clientId === round?.selectedPlayer?.id)
        return round?.allowedMoves;
    return [];
}

function getDealerState(dealer) {
    return {
        cards: getCardsState(dealer?.cards),
        score: dealer?.score
    };
}

function getPlayersState(players) {
    return players.map(p => ({
        id: p.id,
        name: p.name,
        cards: getCardsState(p.cards),
        currentBet: p.currentBet,
        outcome: p.outcome,
        score: p.score,
        totalAmount: p.totalAmount
    }))
}

function getCardsState(cards) {
    return cards?.map(c => ({ rank: c.rank, suit: c.suit }));
}
