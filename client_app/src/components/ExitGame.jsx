import React from 'react'
import { sounds } from "../assets";


export default function ExitGame({ handlers, actions }) {
    const canExitGame = actions?.includes("exitGame");

    function handleExitGame() {
        sounds.buttonclick.play();
        handlers.handleExitGame();
    }

    if (!canExitGame) return;
    return (
        < button
            name="exitGame"
            className='btn btn--secondary'
            onClick={handleExitGame}
            disabled={!canExitGame}>
            Exit Game
        </button>
    )
}
