const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../utils");

module.exports = class Round {
    constructor(players) {
        this.id = generateUniqueId();
        this.players = players;
        this.playerIndex = 0;
        this.dealer = new Dealer();
        this.cards = new GameCards();
        this.#start();
    }

    #start() {
        if (this.players.length === 0)
            throw new Error("At least one player must join to start a new round.");
        for (const player of this.players) {
            this.selectedPlayer = player;
            this.hit();
            this.hit();
        }
        this.selectedPlayer = this.dealer;
        this.hit();
        this.selectedPlayer = this.players[this.playerIndex];
        this.selectedPlayer.canBet === true;
    }


    bet(amount) {
        this.selectedPlayer.bet(amount);
    }

    hit() {
        this.selectedPlayer.pullACard(this.cards.take());
    }

    stand() {
        if (++this.playerIndex < this.players.length) {
            this.selectedPlayer = this.players[this.playerIndex];
            return;
        }
        this.selectedPlayer = this.dealer;
        this.selectedPlayer.play(this);
        this.#transferMoney();
        this.selectedPlayer = null;
    }

    isCompleted() {
        return this.selectedPlayer === null;
    }

    #transferMoney() {
        for (const player of this.players) {
            if (player.isBust()) {
                player.outcome = "DEFEAT";
            } else if (this.dealer.isBust()) {
                player.outcome = "WIN";
                player.totalAmount = 2 * player.currentBet;
            } else if (player.score < this.dealer.score) {
                player.outcome = "DEFEAT";
            } else if (player.score === this.dealer.score) {
                player.outcome = "TIE";
                player.totalAmount = player.currentBet;
            } else if (player.score > this.dealer.score) {
                player.outcome = "WIN";
                player.totalAmount = 2 * player.currentBet;
            } else {
                throw new Error("Unknown state." + this.getStats());
            }
            player.currentBet = 0;
        }
    }

    calculateAllowedMoves() {
        if (this.isCompleted() || this.selectedPlayer.outcome)
            return [];
        if (this.selectedPlayer.canBet === true)
            return ["bet"];
        return ["hit", "stand"];
    }
}
