import React from 'react'
import { useState } from 'react'
import { sounds } from "../assets";


export default function RegistrationForm({ actions, handlers }) {
    const [playerName, setPlayerName] = useState("");
    const canRegisterClient = actions?.includes("registerClient");

    function handleRegisterClient() {
        sounds.buttonclick.play();
        handlers.handleRegisterClient(playerName);
    }

    if (!canRegisterClient) return;
    return (
        <div className='registration_form'>
            <input
                placeholder='Player Name'
                type="text"
                onChange={e => setPlayerName(e.target.value)}>
            </input>
            <button
                className='btn btn--primary'
                name="registerClient"
                onClick={handleRegisterClient}
                disabled={!canRegisterClient}>
                Register
            </button>
        </div>
    )
}
