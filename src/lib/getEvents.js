const { convert } = require('ical2json')
const IcalExpander = require('ical-expander')
const { get } = require('request')
const { writeFile } = require('fs')
const { join } = require('path')
const testEvents = require('../../events')
const maxIterations = 0

const map = e => {
  return {
    summary: e.item.summary,
    component: e.item.component
  }
}

module.exports = (calendar, callback) => {
  get(calendar, (err, response, ics) => {
    if (err) return callback(err)
    const icalExpander = new IcalExpander({ ics, maxIterations })
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 1)
    const events = icalExpander.between(from, to)
    const mappedEvents = events.events.map(map)
    const mappedOccurrences = events.occurrences.map(map)
    const allEvents = [].concat(mappedEvents, mappedOccurrences)
    callback(null, allEvents)
    const file = join(__dirname, '../../events.json')
    const content = JSON.stringify(allEvents, null, 2)
    writeFile(file, content, error => console.error)
  })
}

module.exports = (calendar, callback) => {
  callback(null, testEvents) // .slice(0, 10))
}
