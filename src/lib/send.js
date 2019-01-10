const { createSocket } = require('dgram')
const { send } = createSocket('udp4')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const { parse } = require('yaml')
const log = require('./log')

const configFile = resolve(process.env.HOME, 'lightwaverf-config.yml')
const host = parse(readFileSync(configFile, 'utf8')).host

let messageId = 0

module.exports = (cmd, callback, backoff) => {
  const id = '' + messageId++
  const message = Buffer.from(id + ',' + cmd, 'ascii')
  log('➡️', '', '' + message)
  send(message, 0, message.length, 9760, host || '255.255.255.255')
  if (callback) listeners[id] = { cmd, callback, backoff }
}
