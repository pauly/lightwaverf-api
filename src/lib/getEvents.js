const IcalExpander = require('ical-expander')
const request = require('request')
const sinon = require('sinon') // @todo only temporary!
const { writeFile } = require('fs')
const { join } = require('path')
const maxIterations = 0

const map = e => {
  return {
    summary: e.item.summary,
    component: e.item.component
  }
}

// 👇 this is the real deal but I'm using fake data while developing
module.exports = (calendar, callback) => {
  const testData = require(join(__dirname, '../../basic.ics'))
  sinon.stub(request, 'get').yields(null, null, testData)
  request.get(calendar, (err, response, ics) => {
    request.get.restore && request.get.restore()
    if (err) return callback(err)
    const icalExpander = new IcalExpander({ ics, maxIterations })
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 1)
    const events = icalExpander.between(from, to)
    let file = join(__dirname, '../../raw.json')
    let content = JSON.stringify(events, null, 2)
    writeFile(file, content, err => {
      if (err) console.error(err)
    })
    const mappedEvents = events.events.map(map)
    const mappedOccurrences = events.occurrences.map(map)
    const allEvents = [].concat(mappedEvents, mappedOccurrences)
    callback(null, allEvents)
    file = join(__dirname, '../../events.json')
    content = JSON.stringify(allEvents, null, 2)
    writeFile(file, content, err => {
      if (err) console.error(err)
    })
  })
}
