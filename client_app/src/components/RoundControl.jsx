import React from "react"
import stand from "../assets/stand.png";
import stand_disabled from "../assets/stand_disabled.png";
import deck from "../assets/deck.png";
import deck_disabled from "../assets/deck_disabled.png";
import bet_img from "../assets/bet.png";
import bet_img_disabled from "../assets/bet_disabled.png";
import { useState } from "react";

export default function RoundControl({ handlers, actions }) {
    const canBet = actions?.includes("bet");
    const canHit = actions?.includes("hit");
    const canStand = actions?.includes("stand");

    const [bet, setBet] = useState();

    function handleBetButton() {
        if (!canBet) return;
        handlers.handleBet(bet);
        setBet('');
    }

    return (
        <div className="roundcontrol">
            <section className="bet-section">
                <input
                    placeholder="Bet"
                    type="number"
                    onChange={e => setBet(parseInt(e.target.value))}
                    disabled={!canBet}
                    value={bet}
                />
                <img
                    name="bet"
                    className={"roundcontrol__img" + (canBet ? "" : " roundcontrol__img--disabled")}
                    src={canBet ? bet_img : bet_img_disabled}
                    alt="Casino chips indicating that the player wants to bet."
                    onClick={handleBetButton}
                />
            </section>
            <section className="hit-stand-section">
                <div className="hit">
                    <img
                        name="hit"
                        className={"roundcontrol__img" + (canHit ? "" : " roundcontrol__img--disabled")}
                        src={canHit ? deck : deck_disabled}
                        alt="A deck of cards."
                        onClick={() => canHit && handlers.handleHit()}
                    />
                </div>
                <div className="stand">
                    <img name="stand"
                        className={"roundcontrol__img" + (canStand ? "" : " roundcontrol__img--disabled")}
                        src={canStand ? stand : stand_disabled}
                        alt="A closed palm facing front indicitaing that the player stands."
                        onClick={() => canStand && handlers.handleStand()}
                    />
                </div>
                <div></div>
            </section>
        </div>
    )
}
