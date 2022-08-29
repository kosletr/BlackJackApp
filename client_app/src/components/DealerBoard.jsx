import React from 'react'
import ParticipantBoard from './ParticipantBoard';

export default function DealerBoard({ playerId, dealer, turn }) {
    return (
        <div className='dealerboard'>
            <h1>Casino</h1>
            <ParticipantBoard playerId={playerId} participant={dealer} turn={turn} />
        </div>
    )
}
