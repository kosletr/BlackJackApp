import React from 'react'
import Card from './Card';

export default function ParticipantBoard({ playerId, participant, turn, showFlippedCard = false }) {
    if (!participant || Object.keys(participant).length === 0) return;

    return (
        <div className={"participant" + (participant.id === turn ? " participant__info--active" : "")}>
            <div className={"participant__info"}>
                {participant.name || "Dealer"}
                <span style={{ color: "red" }}>{participant.clientId === playerId ? " (You)" : ""}</span>
            </div>
            <div className='cards' >
                {participant.cards.map((c, idx) => <Card key={idx} rank={c.rank} suit={c.suit} />)}
                {showFlippedCard && <Card />}
            </div>
            {participant.outcome && <div className="outcome">
                {participant.outcome}
            </div>
            }
            {(participant.totalAmount || participant.totalAmount === 0) &&
                <div>
                    <div>Total: {participant.totalAmount}</div>
                    <div>Bet: {participant.currentBet}</div>
                </div>
            }
        </div>
    )
}
