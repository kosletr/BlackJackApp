import React from 'react'
import { images, getCardImagePath } from '../assets';

export default function Card({ rank, suit }) {
    const card = rank && suit
        ? { src: getCardImagePath(rank, suit), alt: `The card ${rank} ${suit}` }
        : { src: images.flipped, alt: "A flipped card" };

    return <img className="card" src={card.src} alt={card.alt} />
}
