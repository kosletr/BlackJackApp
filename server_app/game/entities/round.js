const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../../utils");
const GameError = require("./gameError");

module.exports = class Round {
    constructor(players) {
        this.id = generateUniqueId();
        this.players = players;
        this.playerIndex = 0;
        this.allowedMoves = [];
        this.dealer = new Dealer(generateUniqueId());
        this.cards = new GameCards();
        this.#start();
    }

    #start() {
        if (this.players.length === 0)
            throw new GameError("At least one player must join to start a new round.");
        for (const player of this.players) {
            this.selectedPlayer = player;
            this.hit();
            this.hit();
        }
        this.selectedPlayer = this.dealer;
        this.hit();
        this.selectedPlayer = this.players[0];
        this.allowedMoves = ["bet"];
    }


    bet({ amount }) {
        this.selectedPlayer.bet(amount);
        this.allowedMoves = ["hit", "stand"];
    }

    hit() {
        this.selectedPlayer.pullACard(this.cards.take());
        this.allowedMoves = [];
        if (this.selectedPlayer.isBust()) {
            this.selectedPlayer.outcome = "DEFEAT";
            this.selectedPlayer.currentBet = 0;
            this.stand();
            return;
        }
        this.allowedMoves = ["bet", "hit", "stand"];
    }

    stand() {
        this.playerIndex++;
        if (this.playerIndex < this.players.length) {
            this.selectedPlayer = this.players[this.playerIndex];
            this.allowedMoves = ["bet"];
            return;
        } else if (this.playerIndex === this.players.length) {
            this.selectedPlayer = this.dealer;
            this.selectedPlayer.play(this);
        } else {
            this.selectedPlayer = null;
            this.players.forEach(p => p.transferMoney(this.dealer));
            this.allowedMoves = [];
        }
    }

    isActive() {
        return this.players.some(p => !p.outcome);
    }
}
