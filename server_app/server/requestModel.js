const logger = require('../config/logger');
const validateRequest = require('./validation');

module.exports = class RequestModel {
    constructor(message) {
        this.request = JSON.parse(message);
        logger.info(`Request: ${JSON.stringify(this.request)}`);
        validateRequest(this.request);
    }

    get() {
        return this.request;
    }
}