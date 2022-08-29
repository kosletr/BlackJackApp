import React from 'react'
import { useState } from 'react'

export default function GameControl({ handlers, actions }) {
    const [playerName, setPlayerName] = useState("");

    const canRegisterClient = actions?.includes("registerClient");
    const canStartGame = actions?.includes("startGame");
    const canStartRound = actions?.includes("startRound");
    const canExitGame = actions?.includes("exitGame");

    return (
        <div>
            {canRegisterClient &&
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
            }

            <div className='gamecontrol'>
                {canStartGame &&
                    <button
                        className='btn btn--primary'
                        name="startGame"
                        onClick={() => handlers.handleStartGame()}
                        disabled={!canStartGame}>
                        Start Game
                    </button>
                }
                {canStartRound &&
                    <button
                        name="startRound"
                        className='btn btn--primary'
                        onClick={() => handlers.handleStartRound()}
                        disabled={!canStartRound}>
                        Start Next Round
                    </button>
                }
                <div>
                    {canExitGame &&
                        < button
                            name="exitGame"
                            className='btn btn--primary'
                            onClick={() => handlers.handleExitGame()}
                            disabled={!canExitGame}>
                            Exit Game
                        </button>
                    }
                </div>
            </div >
        </div>
    )
}
