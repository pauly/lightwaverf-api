const winston = require('winston')
const path = require('path')
const filename = path.resolve(process.env.HOME, 'lightwaverf.log')

module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename })
  ]
})

