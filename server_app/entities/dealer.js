const User = require("./user");

module.exports = class Dealer extends User {
    constructor() {
        super("Dealer", Number.MAX_SAFE_INTEGER);
    }
}
