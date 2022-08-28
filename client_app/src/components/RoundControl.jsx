import React from "react"
import stand from "../assets/stand.png";
import stand_disabled from "../assets/stand_disabled.png";
import deck from "../assets/deck.png";
import deck_disabled from "../assets/deck_disabled.png";
import { useState } from "react";

export default function RoundControl({ handlers, actions }) {
    const canBet = actions?.includes("bet");
    const canHit = actions?.includes("hit");
    const canStand = actions?.includes("stand");

    const [bet, setBet] = useState(0);

    return (
        <div className="roundcontrol">
            <section className="bet-section">
                <div className="bet">
                    <input placeholder="Bet" type="number" onChange={e => setBet(parseInt(e.target.value))}></input>
                    <button name="bet" onClick={() => handlers.handleBet(bet)} disabled={!canBet} >Bet</button>
                </div>
            </section>
            <section className="hit-stand-section">
                <div className="hit">
                    <img
                        name="hit"
                        className={"control__img" + (canHit ? "" : " control__img--disabled")}
                        src={canHit ? deck : deck_disabled}
                        alt="A deck of cards."
                        onClick={() => canHit && handlers.handleHit()}
                    />
                </div>
                <div className="stand">
                    <img name="stand"
                        className={"control__img" + (canStand ? "" : " control__img--disabled")}
                        src={canStand ? stand : stand_disabled}
                        alt="A closed palm facing front indicitaing that the player stands."
                        onClick={() => canStand && handlers.handleStand()}
                    />
                </div>
            </section>
        </div>
    )
}
