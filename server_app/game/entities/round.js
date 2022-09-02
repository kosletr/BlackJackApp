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
        this.#resetAllowedMoves([ACTIONS.BET]);
        this.dealtCards = false;
    }

    #resetAllowedMoves(actions) {
        this._players.forEach(p => p.allowedMoves = actions);
    }

    #updateSelectedPlayer() {
        this._selectedParticipant = this._players[this.playerIndex];
        logger.info("Selected Player: ", getPlayerState(this));
    }

    bet({ playerId, amount }) {
        const playerToBet = this.#findPlayerById(playerId);
        playerToBet.bet(amount);
        playerToBet.allowedMoves = [];
        if (!this.#hasEveryPlayerBet()) return;
        this.#finishBeting(amount);
    }

    #findPlayerById(playerId) {
        return this._players.find(p => p.id === playerId);
    }

    #finishBeting(amount) {
        this.#dealCards();
        this.#resetTurnAfterDealingTheCards();
        if (this.#canDoubleDown(amount)) this._selectedParticipant.allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._selectedParticipant.allowedMoves.push(ACTIONS.SPLIT);
        this.dealtCards = true;
    }

    #hasEveryPlayerBet() {
        return this.players.every(p => p.currentBet);
    }

    #setNextParticipant() {
        if (this._selectedParticipant) this._selectedParticipant.allowedMoves = [];
        this.playerIndex++;
        this.#updateSelectedPlayer();
        if (!this._selectedParticipant) this._selectedParticipant = this.dealer;
    }

    #dealCards() {
        for (const player of this._players) this.#drawFromTheCards(player);
        this.#drawFromTheCards(this.dealer);
        for (const player of this._players) this.#drawFromTheCards(player);
    }

    #drawFromTheCards(participant) {
        const card = this.gameCards.draw();
        participant.takeACard(card);
        logger.info(`Participant: ${participant.id} drew the card: `, card);
    }

    #resetTurnAfterDealingTheCards() {
        this.playerIndex = -1;
        this.#continueToNextParticipant();
    }

    #continueToNextParticipant() {
        if (this.isCompleted()) return this.#finishRound();
        this.#setNextParticipant();
        if (this.#isDealersTurn()) return this.dealer.play(this);
        if (this._selectedParticipant.hasBlackJack()) return this.#continueToNextParticipant();
        this._selectedParticipant.allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
        if (this.#canDoubleDown(this._selectedParticipant.currentBet)) this._selectedParticipant.allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._selectedParticipant.allowedMoves.push(ACTIONS.SPLIT);
    }

    isCompleted() {
        return this.playerIndex > this._players.length;
    }

    #finishRound() {
        this._selectedParticipant = null;
        this.#resetAllowedMoves([]);
        this._players.forEach(p => p.transferMoney(this.dealer));
        logger.info("Round is completed.");
    }

    #isDealersTurn() {
        return this._selectedParticipant?.id === this.dealer.id;
    }

    #canDoubleDown(amount) {
        return this._selectedParticipant?.cards.length === 2 &&
            amount <= this._selectedParticipant?.client.totalAmount;
    }

    #canSplit() {
        if (!this._selectedParticipant) return false;
        if (this._selectedParticipant.cards.length !== 2) return false;
        const firstCard = this._selectedParticipant.cards[0];
        const isAnAceCard = firstCard.points.length > 1;
        if (isAnAceCard) return false;
        const secondCard = this._selectedParticipant.cards[1];
        return firstCard.points === secondCard.points;
    }

    hit() {
        this.#drawFromTheCards(this._selectedParticipant);
        if (this._selectedParticipant.hasBestScore()) return this.#continueToNextParticipant();
        if (this._selectedParticipant.isBust()) {
            if (!this.#isDealersTurn()) this._selectedParticipant.lose();
            return this.#continueToNextParticipant();
        }
        this._selectedParticipant.allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
    }

    stand() {
        this.#continueToNextParticipant();
    }

    doubledown() {
        this._selectedParticipant.bet(this._selectedParticipant.currentBet);
        this.#drawFromTheCards(this._selectedParticipant);
        this.#continueToNextParticipant();
    }

    split() {
        if (!this.#canSplit()) throw new GameError("Split is allowed when the player has two cards with the same value.");
        const [firstHand, secondHand] = this._selectedParticipant.split();
        this._players.splice(this.playerIndex, 1, firstHand, secondHand);
        this.#updateSelectedPlayer();
        this._selectedParticipant.allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
    }

    removePlayerByClientId(clientId) {
        logger.info(`Removing player with clientId: ${clientId} from round: ${this.id}`);
        this._players = this._players.filter(p => p.client.id !== clientId);
        if (this._players.length === 0) this.#continueToNextParticipant();
        else if (!this.#hasEveryPlayerBet()) return;
        else if (!this.dealtCards) this.#finishBeting(this._selectedParticipant.currentBet);
        else if (this._selectedParticipant?.client?.id === clientId) {
            this.playerIndex--;
            this.#continueToNextParticipant();
        }
    }

    getAllowedRoundMovesForClient(clientId) {
        const playersOfClient = this.players?.filter(p => p.client.id === clientId);
        return (playersOfClient?.length > 1)
            ? playersOfClient.find(p => p.id === this.selectedParticipant?.id)?.allowedMoves || []
            : playersOfClient[0]?.allowedMoves || [];
    }


    get selectedParticipant() {
        return this._selectedParticipant;
    }

    get players() {
        return this._players;
    }
}
