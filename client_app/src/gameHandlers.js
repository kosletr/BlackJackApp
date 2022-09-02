export default class GameHandlers {
    constructor(ws) {
        this.ws = ws;
    }

    #sendWebSocket(data) {
        this.ws.send(JSON.stringify(data));
    }

    handleRegisterClient(playerName) {
        this.#sendWebSocket({ name: "registerClient", params: { name: playerName } })
    }

    handleStartGame() {
        this.#sendWebSocket({ name: "startGame", params: {} })
    }

    handleStartNextRound() {
        this.#sendWebSocket({ name: "startNextRound", params: {} })
    }

    handleBet(bet) {
        this.#sendWebSocket({ name: "bet", params: { amount: bet } })
    }

    handleHit() {
        this.#sendWebSocket({ name: "hit", params: {} })
    }

    handleStand() {
        this.#sendWebSocket({ name: "stand", params: {} })
    }

    handleSplit() {
        this.#sendWebSocket({ name: "split", params: {} })
    }

    handleDoubleDown() {
        this.#sendWebSocket({ name: "doubledown", params: {} })
    }

    handleExitGame() {
        this.#sendWebSocket({ name: "exitGame", params: {} })
    }

    // handleDisconnect() {
    //     this.ws.close();
    //     console.log("WebSocket Client Disconnected");
    // }

    // handleInvalidCommand() {
    //     this.#sendWebSocket({ name: "asdsad", params: { whatever: "" } })
    // }
}