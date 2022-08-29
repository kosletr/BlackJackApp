import React from 'react'
import Card from './Card';

export default function ParticipantBoard({ playerId, participant, turn }) {
    if (!participant || Object.keys(participant).length === 0) return;

    const showFlippedCard = participant.cards.length === 1;
    return (
        <div className="participant">
            <div className={"participant__info" + (participant.id === turn ? " participant__info--active" : "")}>
                {participant.name || "Dealer"}
                {participant.id === playerId ? " (You)" : ""}
            </div>
            <div className='cards' >
                {participant.cards.map((c, idx) => <Card key={idx} rank={c.rank} suit={c.suit} />)}
                {showFlippedCard && <Card />}
            </div>
            {participant.outcome && <div className="outcome">
                {participant.outcome}
            </div>
            }
            {participant.totalAmount &&
                <div className="totalAmount">
                    Total: {participant.totalAmount}
                </div>
            }
            {Boolean(participant.currentBet) &&
                <div className="currentBet">
                    Bet: {participant.currentBet}
                </div>
            }
        </div>
    )
}
