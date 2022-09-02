const winston = require("winston");

module.exports = process.env.NODE_ENV !== "testing"
    ? winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.colorize(),
            winston.format.simple()
        ),
        transports: [new winston.transports.Console()],
    })
    : { info: () => { }, warn: () => { }, error: () => { } }; // Don't print traces when running  tests.
