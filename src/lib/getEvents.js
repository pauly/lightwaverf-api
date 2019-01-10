const IcalExpander = require('ical-expander')
const request = require('request')
const sinon = require('sinon') // @todo only temporary!
const { join } = require('path')
const maxIterations = 0

const map = e => {
  return {
    summary: e.item.summary,
    component: e.item.component
  }
}

const getTestData = () => {
  if (process.env.NODE_ENV === 'production') return null
  try {
    return require(join(__dirname, '../../basic.ics'))
  } catch (e) {
    // test data is optional anyway
  }
}

module.exports = (calendar, callback) => {
  const testData = getTestData()
  if (testData) sinon.stub(request, 'get').yields(null, null, testData)
  request.get(calendar, (err, response, ics) => {
    if (testData) request.get.restore()
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
  })
}
