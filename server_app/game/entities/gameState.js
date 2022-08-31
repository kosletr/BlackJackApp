module.exports = function getGameState(game, clientId) {
    return {
        allowedMoves: getAllowedMoves(game, clientId),
        dealer: getDealerState(game.currentRound?.dealer),
        players: getPlayersState(game.currentRound?.players),
        selectedPlayerId: game.currentRound?.selectedPlayer?.id,
    }
}


function getAllowedMoves(game, clientId) {
    const roundMoves = game.currentRound?.allowedMoves;
    const gameMoves = [...game.allowedMoves];
    if (roundMoves && clientId === game.getCurrentClientId()) gameMoves.push(...roundMoves);
    return gameMoves;
}

function getDealerState(dealer) {
    if (!dealer) return;
    return {
        id: dealer.id,
        cards: getCardsState(dealer.cards),
        score: dealer.score
    };
}

function getPlayersState(players) {
    if (!players) return;
    return players.map(p => ({
        id: p.id,
        name: p.name,
        cards: getCardsState(p.cards),
        currentBet: p.currentBet,
        outcome: p.outcome,
        score: p.score,
        clientId: p.client.id,
        totalAmount: p.client.totalAmount
    }))
}

function getCardsState(cards) {
    return cards?.map(c => ({ rank: c.rank, suit: c.suit }));
}
