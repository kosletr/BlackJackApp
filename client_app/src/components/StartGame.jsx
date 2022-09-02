import React from 'react'
import { sounds } from "../assets";

export default function StartGame({ handlers, actions }) {
    const canStartGame = actions?.includes("startGame");

    function handleStartGame() {
        sounds.buttonclick.play();
        handlers.handleStartGame();
    }

    if (!canStartGame) return;
    return (
        <button
            name="startGame"
            className='btn btn--primary'
            onClick={handleStartGame}
            disabled={!canStartGame}>
            Start Game
        </button>
    )
}
