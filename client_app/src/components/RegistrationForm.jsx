import React from 'react'
import { useState } from 'react'

export default function RegistrationForm({ actions, handlers }) {
    const [playerName, setPlayerName] = useState("");
    const canRegisterClient = actions?.includes("registerClient");

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
                onClick={() => handlers.handleRegisterClient(playerName)}
                disabled={!canRegisterClient}>
                Register
            </button>
        </div>
    )
}
