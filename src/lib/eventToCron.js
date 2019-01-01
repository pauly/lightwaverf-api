const forState = require('./forState')
const icalDayToZeroIndex = require('./icalDayToZeroIndex')
const cronBoilerPlate = require('./cronBoilerPlate')
const { executable, schedule } = require('../../config')

module.exports = state => (cron, event) => {
  if (event.state) return cron // this is the state, not a real event
  if (!forState(state)(event)) return cron
  const pairs = []
  if (!cron.length) { // first time round
    if (state) cron.push(`# state #${state} so not including all events`)
    pairs.push([`0 4 * * *`, `NODE_ENV=production ${schedule} # and auto schedule the schedule`])
  }
  let date = '*'
  let month = '*'
  let day = '*'
  // @todo non repeating events (don't think I have any)
  if (event.rrule.freq === 'WEEKLY') {
    if (event.rrule.byday) {
      if (!Array.isArray(event.rrule.byday)) {
        event.rrule.byday = [event.rrule.byday]
      }
      day = event.rrule.byday.map(icalDayToZeroIndex).join()
    }
  } else if (event.rrule.freq !== 'DAILY') {
    pairs.push([`# @todo rrule ${JSON.stringify(event)}`])
  }
  if (event.device) {
    pairs.push([`${event.date.getMinutes()} ${event.date.getHours()} ${date} ${month} ${day}`, `${executable} ${event.room} ${event.device} ${event.status || 'on'}`])
    if (!event.status) {
      pairs.push([`${event.end.getMinutes()} ${event.end.getHours()} ${date} ${month} ${day}`, `${executable} ${event.room} ${event.device} off`])
    }
  } else if (event.sequence) {
    pairs.push([`${event.date.getMinutes()} ${event.date.getHours()} ${date} ${month} ${day}`, `${executable} sequence ${event.sequence}`])
  } else {
    pairs.push([`# @todo ${JSON.stringify(event)}`])
  }
  return cron.concat(pairs.map(cronBoilerPlate))
}
