import bet_image from "./assets/images/bet.png";
import bet_disabled_image from "./assets/images/bet_disabled.png";
import flipped_image from './assets/images/flipped.png';
import hit_image from "./assets/images/hit.png";
import hit_disabled_image from "./assets/images/hit_disabled.png";
import stand_image from "./assets/images/stand.png";
import stand_disabled_image from "./assets/images/stand_disabled.png";
import split_image from "./assets/images/split.png";
import split_disabled_image from "./assets/images/split_disabled.png";
import doubledown_image from "./assets/images/doubledown.png";
import doubledown_disabled_image from "./assets/images/doubledown_disabled.png";

import buttonclick_sound from "./assets/sounds/buttonclick.mp3";
import drawingcard_sound from "./assets/sounds/drawingcard.mp3";
import bet_sound from "./assets/sounds/bet.mp3";
import stand_sound from "./assets/sounds/stand.mp3";
import split_sound from "./assets/sounds/split.mp3";


export const images = {
    bet: bet_image,
    bet_disabled: bet_disabled_image,
    flipped: flipped_image,
    hit: hit_image,
    hit_disabled: hit_disabled_image,
    stand: stand_image,
    stand_disabled: stand_disabled_image,
    split: split_image,
    split_disabled: split_disabled_image,
    doubledown: doubledown_image,
    doubledown_disabled: doubledown_disabled_image,
};

export const sounds = {
    buttonclick: new Audio(buttonclick_sound),
    drawingcard: new Audio(drawingcard_sound),
    bet: new Audio(bet_sound),
    stand: new Audio(stand_sound),
    split: new Audio(split_sound),
    doubledown: new Audio(bet_sound),
};

export const getCardImagePath = (function () {
    const cardPaths = {};
    const r = require.context("./assets/images/cards", false, /\.(png)$/);
    r.keys().forEach(item => cardPaths[item.replace('./', '').replace('.png', '')] = r(item));
    console.log(cardPaths)
    return (rank, suit) => cardPaths[`${rank}_${suit}`];
})();
