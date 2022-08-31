import React from 'react'

export default function GameControl({ handlers, actions }) {

    const canStartGame = actions?.includes("startGame");
    const canStartRound = actions?.includes("startRound");
    const canExitGame = actions?.includes("exitGame");

    return (
        <div className='gamecontrol'>
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
                        Next Round
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
