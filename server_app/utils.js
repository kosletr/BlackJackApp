let i = 0;

function generateUniqueId() {
    console.log("id", i);
    return (i++).toString();
}

module.exports = { generateUniqueId }
