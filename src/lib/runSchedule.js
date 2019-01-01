const { resolve } = require('path')
const { readFileSync } = require('fs')
const { parse, stringify } = require('yaml')

const eventToCron = require('./eventToCron')
const getEvents = require('./getEvents')
const getRebootDevices = require('./getRebootDevices')
const getState = require('./getState')
const tokeniseEvent = require('./tokeniseEvent')
const updateCron = require('./updateCron')
const { calendar, room } = parse(readFileSync(resolve(process.env.HOME, 'lightwaverf-config.yml'), 'utf8'))

module.exports = callback => {
  getEvents(calendar, (err, allEvents) => {
    if (err || !allEvents) return callback(err || 'no events')
    const events = allEvents.map(tokeniseEvent)
    const state = events.reduce(getState, null)
    const reboots = room.reduce(getRebootDevices, [])
    const cron = events.reduce(eventToCron(state), [])
      .concat(reboots)
    updateCron(cron.join('\n'), err => {
      callback(err, cron)
    })
  })
}
