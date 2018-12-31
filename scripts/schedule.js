#!/usr/bin/env node
const { resolve } = require('path')
const { load } = require('yml')
const { eventToCron, getEvents, getState, tokeniseEvent, updateCron } = require('../src/lib')

const { calendar } = load(resolve(process.env.HOME, 'lightwaverf-config.yml')) || {}

getEvents(calendar, (err, allEvents) => {
  if (err) return console.error(err)
  const events = allEvents.map(tokeniseEvent)
  const state = events.reduce(getState, null)
  const cron = events.reduce(eventToCron(state), [])
  updateCron(cron.join('\n'), err => {
    if (err) return console.error(err)
    console.log(`👍 done!`, cron)
  })
})
