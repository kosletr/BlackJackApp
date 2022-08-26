const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const { generateUniqueId } = require("../utils");

module.exports = class Round {
    constructor(players) {
        this.id = generateUniqueId();
        this.players = players;
        this.playerIndex = 0;
        this.turns = [];
        this.dealer = new Dealer(generateUniqueId());
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
        this.turns = [];
        this.allowedMoves = ["bet"];
        this.#saveTurn();
    }


    bet(amount) {
        this.selectedPlayer.bet(amount);
        this.allowedMoves = ["hit", "stand"];
        this.#saveTurn();
    }

    hit() {
        this.selectedPlayer.pullACard(this.cards.take());
        this.allowedMoves = ["hit", "stand"];
        if (this.selectedPlayer.isBust()) {
            this.selectedPlayer.outcome = "DEFEAT";
            this.selectedPlayer.currentBet = 0;
            this.allowedMoves = [];
            this.playerIndex++;
        } else if (!this.selectedPlayer.outcome) {
            this.allowedMoves.push("bet");
        }
        this.#saveTurn();
    }

    stand() {
        if (++this.playerIndex < this.players.length) {
            this.selectedPlayer = this.players[this.playerIndex];
            this.#saveTurn();
            return;
        }
        this.selectedPlayer = this.dealer;
        this.selectedPlayer.play(this);
        this.#transferMoney();
        this.allowedMoves = [];
        this.#saveTurn();
    }

    isActive() {
        return this.players.some(p => !p.outcome);
    }

    #saveTurn() {
        const copy = JSON.parse(JSON.stringify(this));
        delete copy.turns;
        this.turns.push(copy);
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
}
