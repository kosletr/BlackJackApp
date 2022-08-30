const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");
const { ACTIONS, BEST_SCORE } = require("../constants");

module.exports = class Round {
    constructor(players) {
        if (players.length === 0)
            throw new GameError("At least one player must join to start a new round.");
        this._players = players;
        this.id = generateUniqueId();
        this.playerIndex = 0;
        this.dealer = new Dealer();
        this.gameCards = new GameCards();
        this._selectedPlayer = this._players[0];
        this._allowedMoves = [ACTIONS.BET];
    }

    bet({ amount }) {
        this._selectedPlayer.bet(amount);
        const waitingForMoreBets = this.players.some(p => !p.currentBet);
        if (waitingForMoreBets) {
            this._selectedPlayer = this._players[++this.playerIndex];
            this._allowedMoves = [ACTIONS.BET];
            return;
        }
        this.playerIndex = this.#dealCardsAndGetPlayerIndex();
        this._selectedPlayer = this._players[this.playerIndex] || this.dealer;
        if (this.selectedPlayer?.id === this.dealer.id) {
            this.playerIndex--;
            this.#finishParticipantHand();
            return;
        }
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
        if (this.#canDoubleDown(amount)) this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
        if (this.#canSplit()) this._allowedMoves.push(ACTIONS.SPLIT);
    }

    #dealCardsAndGetPlayerIndex() {
        const participants = [...this._players, this.dealer];
        for (const participant of participants) {
            participant.takeACard(this.gameCards.draw());
            if (participant.id !== this.dealer.id) participant.takeACard(this.gameCards.draw());
        }
        let participantIndex = 0;
        for (const participant of participants) { // skip following players having a blackjack
            if (participant.hasBlackJack()) participantIndex++;
            else break;
        }
        return participantIndex;
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
        this._selectedPlayer.takeACard(this.gameCards.draw());
        if (this._selectedPlayer.score === BEST_SCORE) {
            this.#finishParticipantHand();
        } else if (this._selectedPlayer.isBust()) {
            if (this._selectedPlayer !== this.dealer) this._selectedPlayer.lose();
            this.#finishParticipantHand();
        } else {
            this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
        }
    }

    stand() {
        this.#finishParticipantHand();
    }

    doubledown() {
        const playerId = this._selectedPlayer.id;
        this._selectedPlayer.bet(this._selectedPlayer.currentBet);
        this.hit();
        if (this._selectedPlayer.id === playerId) // did not bust or have blackjack.
            this.#finishParticipantHand();
    }

    #finishParticipantHand() {
        this.playerIndex++;
        if (this.playerIndex < this._players.length) {
            this._selectedPlayer = this._players[this.playerIndex];
            if (this.selectedPlayer.hasBlackJack()) {
                this.#finishParticipantHand();
                return;
            }
            this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
            if (this.#canDoubleDown(this._selectedPlayer.currentBet))
                this._allowedMoves.push(ACTIONS.DOUBLE_DOWN);
            if (this.#canSplit())
                this._allowedMoves.push(ACTIONS.SPLIT);
        } else if (this.playerIndex === this._players.length) {
            this._selectedPlayer = this.dealer;
            this._selectedPlayer.play(this);
        } else {
            this.#finishRound();
        }
    }

    #finishRound() {
        this._selectedPlayer = null;
        this._allowedMoves = [];
        this._players.forEach(p => p.transferMoney(this.dealer));
    }

    split() {
        if (!this.#canSplit()) throw new Error("Split is allowed when the player has two cards with the same value.");
        const [firstHand, secondHand] = this._selectedPlayer.split();
        this._players.splice(this.currentIndex, 1, firstHand, secondHand);
        this._selectedPlayer = this._players[this.playerIndex];
        this._allowedMoves = [ACTIONS.HIT, ACTIONS.STAND];
    }

    isInProgress() {
        return this._players.some(p => !p.outcome);
    }

    removeClientById(clientId) {
        this._players = this._players.filter(p => p.client.id !== clientId);
        if (this._selectedPlayer.client.id === clientId)
            this._selectedPlayer = this._players[this.playerIndex];
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
