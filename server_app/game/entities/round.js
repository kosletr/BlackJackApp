const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");
const { ACTIONS } = require("../constants");

module.exports = class Round {
    constructor(players) {
        if (players.length === 0) throw new GameError("At least one player must join to start a new round.");
        this._players = players;
        this.id = generateUniqueId();
        this.playerIndex = 0;
        this.#updateSelectedPlayer();
        this.dealer = new Dealer();
        this.gameCards = new GameCards();
        this._allowedMoves = [ACTIONS.BET];
    }

    #updateSelectedPlayer() {
        this._selectedPlayer = this._players[this.playerIndex];
    }

    bet({ amount }) {
        this._selectedPlayer.bet(amount);
        if (!this.#hasEveryPlayerBet()) return this.#waitForTheNextPlayerToBet();
        this.#dealCards();
        this.#resetTurnAfterDealer();
        if (this.#canDoubleDown(amount)) this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._allowedMoves.push(ACTIONS.SPLIT);
    }

    #hasEveryPlayerBet() {
        return this.players.every(p => p.currentBet);
    }

    #waitForTheNextPlayerToBet() {
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
        this.dealer.takeACard(this.gameCards.draw());
        for (const player of this._players) this.#drawFromTheCards(player);
    }

    #drawFromTheCards(player) {
        player.takeACard(this.gameCards.draw());
    }

    #resetTurnAfterDealer() {
        this.playerIndex = -1;
        this.#finishParticipantHand();
    }

    #finishParticipantHand() {
        if (!this.isInProgress()) return this.#finishRound();
        this.#setNextParticipant();
        if (this.#isDealersTurn()) return this.dealer.play(this);
        if (this.selectedPlayer.hasBlackJack()) return this.#finishParticipantHand();
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
        if (this.#canDoubleDown(this._selectedPlayer.currentBet)) this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._allowedMoves.push(ACTIONS.SPLIT);
    }

    isInProgress() {
        return this.playerIndex <= this._players.length;
    }

    #finishRound() {
        this._selectedPlayer = null;
        this._allowedMoves = [];
        this._players.forEach(p => p.transferMoney(this.dealer));
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

    removeClientById(clientId) {
        this._players = this._players.filter(p => p.client.id !== clientId);
        if (this._selectedPlayer.client.id === clientId) this.#updateSelectedPlayer();
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
