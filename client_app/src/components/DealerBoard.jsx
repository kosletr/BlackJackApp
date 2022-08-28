import React from 'react'
import ParticipantBoard from './ParticipantBoard';

export default function DealerBoard({ playerId, dealer, turn }) {
    return (
        <div className='dealerboard'>
            <ParticipantBoard playerId={playerId} participant={dealer} turn={turn} />
        </div>
    )
}
