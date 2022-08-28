import React from 'react'
import { useState } from 'react'

export default function GameControl({ handlers, actions }) {
    const [playerName, setPlayerName] = useState("");

    const canRegisterClient = actions?.includes("registerClient");
    const canStartGame = actions?.includes("startGame");
    const canStartRound = actions?.includes("startRound");
    const canExitGame = actions?.includes("exitGame");

    return (
        <div className='gamecontrol'>
            <div>
                <input
                    placeholder='Player Name'
                    type="text"
                    onChange={e => setPlayerName(e.target.value)}>
                </input>
                <button
                    name="registerClient"
                    onClick={() => handlers.handleRegisterClient(playerName)}
                    disabled={!canRegisterClient}>
                    Register
                </button>
            </div>
            <button
                name="startGame"
                onClick={() => handlers.handleStartGame()}
                disabled={!canStartGame}>
                Start Game
            </button>
            <button
                name="startRound"
                onClick={() => handlers.handleStartRound()}
                disabled={!canStartRound}>
                Start Next Round
            </button>
            <div>
                <button
                    name="exitGame"
                    onClick={() => handlers.handleExitGame()}
                    disabled={!canExitGame}>
                    Exit Game
                </button>
                <button
                    name="disconnect"
                    onClick={() => handlers.handleDisconnect()}>
                    Disconnect
                </button>
                <button
                    onClick={() => handlers.handleInvalidCommand()}>
                    Invalid Command
                </button>
            </div>
        </div>
    )
}
