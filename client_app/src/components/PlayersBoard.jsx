import React from "react"
import ParticipantBoard from "./ParticipantBoard";

export default function PlayersBoard({ playerId, players, turn }) {
    return (
        <div className="playersboard">
            {players?.map(p => <ParticipantBoard key={p.id} playerId={playerId} participant={p} turn={turn} />)}
        </div>
    )
}
