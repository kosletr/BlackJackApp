let i = 0;

function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function create3DArray(layers, rows, columns) {
    return Array.from({ length: layers }, () => (
        Array.from({ length: rows }, () => (
            Array.from({ length: columns }, () => null)
        ))
    ));
}

function sumOfArray(array) {
    return array.reduce((sum, curr) => sum + curr, 0);
}


module.exports = { generateUniqueId, getRandomInt, create3DArray, sumOfArray }
