import React from "react"
import { useState } from "react";
import { sounds, images } from "../assets";

export default function RoundControl({ handlers, actions, configurations }) {
    const canBet = actions?.includes("bet");
    const canHit = actions?.includes("hit");
    const canStand = actions?.includes("stand");
    const canSplit = actions?.includes("split");
    const canDoubleDown = actions?.includes("doubledown");

    const [bet, setBet] = useState('');

    function onBet() {
        if (!canBet) return;
        sounds.bet.play();
        handlers.handleBet(bet);
        setBet('');
    }

    function onHit() {
        if (!canHit) return;
        sounds.drawingcard.play();
        handlers.handleHit();
    }

    function onStand() {
        if (!canStand) return;
        sounds.stand.play();
        handlers.handleStand();
    }

    function onSplit() {
        if (!canSplit) return;
        sounds.split.play();
        handlers.handleSplit();
    }

    function onDoubleDown() {
        if (!canDoubleDown) return;
        sounds.doubledown.play();
        handlers.handleDoubleDown();
    }

    return (
        <div className="roundcontrol">
            <section className="bet">
                {configurations &&
                    <div className="bet__info">
                        Min Bet: {configurations?.MIN_BET}
                    </div>
                }
                <div className="bet__form">
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
                        src={canBet ? images.bet : images.bet_disabled}
                        alt="Casino chips indicating that the player wants to bet."
                        onClick={onBet}
                    />
                </div>
            </section>
            <section className="hit-stand-section">
                <div className="hit">
                    <img
                        name="hit"
                        className={"roundcontrol__img" + (canHit ? "" : " roundcontrol__img--disabled")}
                        src={canHit ? images.deck : images.deck_disabled}
                        alt="A deck of cards."
                        onClick={onHit}
                    />
                </div>
                <div className="stand">
                    <img name="stand"
                        className={"roundcontrol__img" + (canStand ? "" : " roundcontrol__img--disabled")}
                        src={canStand ? images.stand : images.stand_disabled}
                        alt="A closed palm facing front indicitaing that the player stands."
                        onClick={onStand}
                    />
                </div>
                <div className="split">
                    <img name="split"
                        className={"roundcontrol__img" + (canSplit ? "" : " roundcontrol__img--disabled")}
                        src={canSplit ? images.split : images.split_disabled}
                        alt="."
                        onClick={onSplit}
                    />
                </div>
                <div className="doubledown">
                    <img name="doubledown"
                        className={"roundcontrol__img" + (canDoubleDown ? "" : " roundcontrol__img--disabled")}
                        src={canDoubleDown ? images.doubledown : images.doubledown_disabled}
                        alt="A closed palm facing front indicitaing that the player doubles the wager."
                        onClick={onDoubleDown}
                    />
                </div>
            </section>
        </div>
    )
}
