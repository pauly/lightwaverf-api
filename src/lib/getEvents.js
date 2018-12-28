const { convert } = require('ical2json')
const { get } = require('request')
const testEvents = require('../../events')

/* const getEvents = (calendar, callback) => {
  get(calendar, (err, response, ical) => {
    // console.log(calendar, err, ical)
    if (err) return callback(err)
    const json = convert(ical)
    callback(null, json.VCALENDAR[0].VEVENT)
  })
}) */

module.exports = (calendar, callback) => {
  callback(null, testEvents) // .slice(0, 10))
}
