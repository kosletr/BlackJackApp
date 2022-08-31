// UUID v4
function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getPlayerState(round) {
    const gameId = round.gameId;
    const roundId = round.id;
    let participant = round.selectedPlayer;
    if (!participant) participant = round.dealer;
    const playerId = participant?.playerId;
    const name = participant?.name;
    const cards = participant?.cards;
    const outcome = participant?.outcome;
    const clientId = participant?.client?.clientId;
    const totalAmount = participant?.client?.totalAmount;
    return { gameId, roundId, playerId, name, cards, outcome, clientId, totalAmount };
}

module.exports = { generateUniqueId, getPlayerState };
