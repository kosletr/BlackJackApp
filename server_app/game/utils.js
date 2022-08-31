// Modern version of the Fisher–Yates shuffle algorithm
function shuffleArray(array) {
    let j;
    for (let i = array.length - 1; i >= 0; i--) {
        j = Math.floor(Math.random() * i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = { shuffleArray };
