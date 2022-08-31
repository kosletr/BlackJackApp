import React from 'react'
import ParticipantBoard from './ParticipantBoard';

export default function DealerBoard({ playerId, dealer, turn }) {
    const showFlippedCard = dealer?.cards.length === 1;
    return (
        <div className='dealerboard players'>
            <div className='board-title'>Casino</div>
            <ParticipantBoard
                playerId={playerId}
                participant={dealer}
                turn={turn}
                showFlippedCard={showFlippedCard}
            />
        </div>
    )
}
