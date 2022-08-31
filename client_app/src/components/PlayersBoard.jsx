import React from "react"
import ParticipantBoard from "./ParticipantBoard";

export default function PlayersBoard({ playerId, players, turn }) {
    return (
        <div className="playersboard players">
            <div className="board-title">Players</div>
            <div className="playerslist">
                {players?.map(p => <ParticipantBoard key={p.id} playerId={playerId} participant={p} turn={turn} />)}
            </div>
        </div>
    )
}
