import React from 'react'
import { sounds } from "../assets";

export default function StartRound({ handlers, actions }) {
    const canStartRound = actions?.includes("startRound");

    function handleStartRound() {
        sounds.buttonclick.play();
        handlers.handleStartRound();
    }

    if (!canStartRound) return;
    return (
        <button
            name="startRound"
            className='btn btn--tertiary'
            onClick={handleStartRound}
            disabled={!canStartRound}>
            Next Round
        </button>)
}
