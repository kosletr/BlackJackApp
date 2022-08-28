import React from 'react'
import flipped from '../assets/flipped.png';

const cardPaths = {};
const r = require.context('../assets/cards', false, /\.(png)$/);
r.keys().forEach(item => cardPaths[item.replace('./', '').replace('.png', '')] = r(item));
const getCardImagePath = (rank, suit) => cardPaths[`${rank}_${suit}`];

export default function Card({ rank, suit }) {
    const card = rank && suit
        ? { src: getCardImagePath(rank, suit), alt: `The card ${rank} ${suit}` }
        : { src: flipped, alt: "A flipped card" };

    return (
        <>
            <img className="card" src={card.src} alt={card.alt}></img>
        </>
    )
}
