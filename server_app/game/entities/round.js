const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId, getPlayerState } = require("../../utils");
const GameError = require("./gameError");
const { ACTIONS } = require("../constants");
const logger = require("../../config/logger");

module.exports = class Round {
    constructor(players, gameId) {
        if (players.length === 0) throw new GameError("At least one player must join to start a new round.");
        this._players = players;
        this.gameId = gameId;
        this.id = generateUniqueId();
        this.playerIndex = 0;
        this.#updateSelectedPlayer();
        this.dealer = new Dealer(this.gameId);
        this.gameCards = new GameCards();
        this._allowedMoves = [ACTIONS.BET];
        this.dealtCards = false;
    }

    #updateSelectedPlayer() {
        this._selectedPlayer = this._players[this.playerIndex];
        logger.info("Selected Player: ", getPlayerState(this));
    }

    bet({ amount }) {
        this._selectedPlayer.bet(amount);
        if (!this.#hasEveryPlayerBet()) return this.#askNextPlayerToBet();
        this.#finishBeting(amount);
    }

    #finishBeting(amount) {
        this.#dealCards();
        this.#resetTurnAfterDealingTheCards();
        if (this.#canDoubleDown(amount)) this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._allowedMoves.push(ACTIONS.SPLIT);
        this.dealtCards = true;
    }

    #hasEveryPlayerBet() {
        return this.players.every(p => p.currentBet);
    }

    #askNextPlayerToBet() {
        this._allowedMoves = [ACTIONS.BET];
        this.#setNextParticipant();
    }

    #setNextParticipant() {
        this.playerIndex++;
        this.#updateSelectedPlayer();
        if (!this._selectedPlayer) this._selectedPlayer = this.dealer;
    }

    #dealCards() {
        for (const player of this._players) this.#drawFromTheCards(player);
        this.#drawFromTheCards(this.dealer);
        for (const player of this._players) this.#drawFromTheCards(player);
    }

    #drawFromTheCards(participant) {
        participant.takeACard(this.gameCards.draw());
    }

    #resetTurnAfterDealingTheCards() {
        this.playerIndex = -1;
        this.#finishParticipantHand();
    }

    #finishParticipantHand() {
        if (this.isCompleted()) return this.#finishRound();
        this.#setNextParticipant();
        if (this.#isDealersTurn()) return this.dealer.play(this);
        if (this.selectedPlayer.hasBlackJack()) return this.#finishParticipantHand();
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
        if (this.#canDoubleDown(this._selectedPlayer.currentBet)) this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._allowedMoves.push(ACTIONS.SPLIT);
    }

    isCompleted() {
        return this.playerIndex > this._players.length;
    }

    #finishRound() {
        this._selectedPlayer = null;
        this._allowedMoves = [];
        this._players.forEach(p => p.transferMoney(this.dealer));
        logger.info("Round is completed.");
    }

    #isDealersTurn() {
        return this._selectedPlayer?.id === this.dealer.id;
    }

    #canDoubleDown(amount) {
        return this._selectedPlayer?.cards.length === 2 &&
            2 * amount <= this._selectedPlayer?.client.totalAmount;
    }

    #canSplit() {
        if (!this._selectedPlayer) return false;
        if (this._selectedPlayer.cards.length !== 2) return false;
        const firstCard = this._selectedPlayer.cards[0];
        const isAnAceCard = firstCard.points.length > 1;
        if (isAnAceCard) return false;
        const secondCard = this._selectedPlayer.cards[1];
        return firstCard.points === secondCard.points;
    }

    hit() {
        this.#drawFromTheCards(this._selectedPlayer);
        if (this._selectedPlayer.hasBestScore()) return this.#finishParticipantHand();
        if (this._selectedPlayer.isBust()) {
            if (!this.#isDealersTurn()) this._selectedPlayer.lose();
            return this.#finishParticipantHand();
        }
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
    }

    stand() {
        this.#finishParticipantHand();
    }

    doubledown() {
        this._selectedPlayer.bet(this._selectedPlayer.currentBet);
        this.#drawFromTheCards(this._selectedPlayer);
        this.#finishParticipantHand();
    }

    split() {
        if (!this.#canSplit()) throw new Error("Split is allowed when the player has two cards with the same value.");
        const [firstHand, secondHand] = this._selectedPlayer.split();
        this._players.splice(this.currentIndex, 1, firstHand, secondHand);
        this.#updateSelectedPlayer();
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
    }

    removePlayerByClientId(clientId) {
        logger.info(`Removing player with clientId: ${clientId} from round: ${this.id}`);
        this._players = this._players.filter(p => p.client.id !== clientId);
        if (this._players.length === 0) this.#finishParticipantHand();
        else if (this._selectedPlayer?.client?.id === clientId) {
            this.playerIndex--;
            if (!this.#hasEveryPlayerBet()) this.#askNextPlayerToBet();
            else if (!this.dealtCards) this.#finishBeting(this.selectedPlayer.currentBet);
            else this.#finishParticipantHand();
        }
    }

    get selectedPlayer() {
        return this._selectedPlayer;
    }

    get allowedMoves() {
        return this._allowedMoves;
    }

    get players() {
        return this._players;
    }
}
