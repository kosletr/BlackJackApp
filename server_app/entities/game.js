const GameCards = require("./gameCards");
const Dealer = require("./dealer");
const Player = require("./player");
const { BEST_SCORE } = require("./constants");


class Game {
    constructor() {
        this.players = [];
        this.playerIndex = 0;
        this.dealer = new Dealer();
        this.gameCards = new GameCards();
    }

    addPlayer(name, totalAmount) {
        this.players.push(new Player(name, totalAmount));
    }

    removePlayer(name) {
        this.players = this.players.filter(p => p.name !== name);
    }

    stand() {
        if (this.playerIndex < this.players.length)
            this.selectedPlayer = this.players[this.playerIndex];
        else if (this.playerIndex === this.players.length)
            this.selectedPlayer = this.dealer;
        else
            this.transferAmounts();
        this.playerIndex++;
    }

    transferAmounts() {
        for (const player of this.players) {
            if (player.score > BEST_SCORE) {
            } else if (this.dealer.score > BEST_SCORE) {
                player.totalAmount = 2 * player.currentBet;
            } else if (player.score < this.dealer.score) {
            } else if (player.score === this.dealer.score) {
                player.totalAmount = player.currentBet;
            } else if (player.score > this.dealer.score) {
                player.totalAmount = 2 * player.currentBet;
            }
            player.currentBet = 0;
        }
    }

    showBalance() {
        console.log("\n--- BALANCE START ---");
        for (const player of this.players)
            console.log(`Player: ${player.name} -> ${player.totalAmount}`);
        console.log("--- BALANCE END ---\n");
    }

    hit() {
        this.selectedPlayer.pullACard(this.gameCards.take());
        console.log(`Player: ${this.selectedPlayer.name} -> ${this.selectedPlayer.score}`);

    }

    simulate() {
        console.log("Game starts.\n");
        this.stand();

        this.selectedPlayer.bet(50);
        this.hit();
        this.hit();
        this.stand();

        this.selectedPlayer.bet(50);
        this.hit();
        this.hit();
        this.stand();

        this.showBalance();
        this.hit();
        this.hit();
        this.stand();

        this.showBalance();
    }

}

const game = new Game();
game.addPlayer("Kostas", 100);
game.addPlayer("Giannis", 50);
game.simulate();


module.exports = Game;