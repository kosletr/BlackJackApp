const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");

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
        this._allowedMoves = ["bet"];
        this.areCardsDealt = false;
    }

    bet({ amount }) {
        this._selectedPlayer.bet(amount);
        if (this.players.some(p => !p.currentBet)) {
            this.playerIndex++;
            if (this.playerIndex < this._players.length) {
                this._selectedPlayer = this._players[this.playerIndex];
                this._allowedMoves = ["bet"];
                return;
            }
        }
        this.#dealCards();
        this._allowedMoves = ["hit", "stand"];
        if (this.#canDoubleDown(amount)) this._allowedMoves.push("doubledown");
        if (this.#canSplit()) this._allowedMoves.push("split");
    }

    #dealCards() {
        for (const player of this._players) {
            this._selectedPlayer = player;
            this.hit();
            this.hit();
        }
        if (this._selectedPlayer !== null) { // Last player had a blackjack.
            this._selectedPlayer = this.dealer;
            this.hit();
            this.playerIndex = 0;
            this._selectedPlayer = this._players[this.playerIndex];
        }
        this.areCardsDealt = true;
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
        if (this._selectedPlayer.hasBlackJack()) {
            this.#finishParticipantHand();
        } else if (this._selectedPlayer.isBust()) {
            if (this._selectedPlayer !== this.dealer) this._selectedPlayer.lose();
            this.#finishParticipantHand();
        } else {
            this._allowedMoves = ["hit", "stand"];
        }
    }

    stand() {
        this.#finishParticipantHand();
    }

    doubledown({ amount }) {
        const playerId = this._selectedPlayer.id;
        this._selectedPlayer.bet(amount);
        this.hit();
        if (this._selectedPlayer.id === playerId)
            this.#finishParticipantHand();
    }

    #finishParticipantHand() {
        this.playerIndex++;
        if (this.playerIndex < this._players.length) {
            this._selectedPlayer = this._players[this.playerIndex];
            this._allowedMoves = ["hit", "stand"];
            if (this.#canDoubleDown(this._selectedPlayer.currentBet)) this._allowedMoves.push("doubledown");
            if (this.#canSplit()) this._allowedMoves.push("split");
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
        this._allowedMoves = ["stand", "hit"];
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
