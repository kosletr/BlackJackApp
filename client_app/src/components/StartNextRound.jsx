import React from 'react'
import { sounds } from "../assets";

export default function StartNextRound({ handlers, actions }) {
    const canStartNextRound = actions?.includes("startNextRound");

    function handleStartNextRound() {
        sounds.buttonclick.play();
        handlers.handleStartNextRound();
    }

    if (!canStartNextRound) return;
    return (
        <button
            name="startNextRound"
            className='btn btn--tertiary'
            onClick={handleStartNextRound}
            disabled={!canStartNextRound}>
            Next Round
        </button>)
}
