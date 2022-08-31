import React from "react"
import bet_img from "../assets/bet.png";
import bet_img_disabled from "../assets/bet_disabled.png";
import deck from "../assets/deck.png";
import deck_disabled from "../assets/deck_disabled.png";
import stand from "../assets/stand.png";
import stand_disabled from "../assets/stand_disabled.png";
import split from "../assets/split.png";
import split_disabled from "../assets/split_disabled.png";
import doubledown from "../assets/doubledown.png";
import doubledown_disabled from "../assets/doubledown_disabled.png";
import { useState } from "react";

export default function RoundControl({ handlers, actions, configurations }) {
    const canBet = actions?.includes("bet");
    const canHit = actions?.includes("hit");
    const canStand = actions?.includes("stand");
    const canSplit = actions?.includes("split");
    const canDoubleDown = actions?.includes("doubledown");

    const [bet, setBet] = useState('');

    function handleBetButton() {
        if (!canBet) return;
        handlers.handleBet(bet);
        setBet('');
    }

    return (
        <div className="roundcontrol">
            <section className="bet-section">
                {configurations &&
                    <div style={{ alignSelf: "center", whiteSpace: "nowrap" }}>
                        Min Bet: {configurations?.MIN_BET}
                    </div>
                }
                <input
                    placeholder="Bet"
                    type="number"
                    min={configurations?.MIN_BET || 0}
                    max={configurations?.totalAmount}
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
                <div className="split">
                    <img name="split"
                        className={"roundcontrol__img" + (canSplit ? "" : " roundcontrol__img--disabled")}
                        src={canSplit ? split : split_disabled}
                        alt="."
                        onClick={() => canSplit && handlers.handleSplit()}
                    />
                </div>
                <div className="doubledown">
                    <img name="doubledown"
                        className={"roundcontrol__img" + (canDoubleDown ? "" : " roundcontrol__img--disabled")}
                        src={canDoubleDown ? doubledown : doubledown_disabled}
                        alt="A closed palm facing front indicitaing that the player doubles the wager."
                        onClick={() => canDoubleDown && handlers.handleDoubleDown()}
                    />
                </div>
            </section>
        </div>
    )
}
