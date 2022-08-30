const Card = require("../../game/entities/card");
const GameCards = require("../../game/entities/gameCards");

function drawCustomCards(cards) {
    const gameCards = new GameCards();
    const cardsSize = gameCards.remainingCards.length;
    for (let i = 0; i < cards.length; i++)
        gameCards.remainingCards[cardsSize - 1 - i] = new Card(cards[i].rank, cards[i].suit);
    return gameCards;
}

module.exports = { drawCustomCards };
