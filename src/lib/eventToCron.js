const { relative, resolve } = require('path')
const forState = require('./forState')
const icalDayToZeroIndex = require('./icalDayToZeroIndex')
const executable = relative(process.env.HOME, resolve(__dirname, '..', '..', 'scripts', 'operate.js'))
const schedule = relative(process.env.HOME, resolve(__dirname, '..', '..', 'scripts', 'schedule.js'))

// helper so I don't have to add the boilerplate each time
// addBoilerplate([foo, bar]) === `foo bash -etc 'bar' > /tmp/bar.out 2&! # comment`
const addBoilerplate = frequenceAndCommand => {
  const [frequency, rest] = frequenceAndCommand
  if (!rest) return `# ${frequency}`
  const [command, comment] = rest.split('#')
  const tempFile = command.replace(executable, '').trim().replace(/\W+/g, '-')
  return `${frequency} bash -l -c '${command}' > /tmp/${tempFile}.out 2>&1 ${comment ? '# ' + comment : ''}`
}

module.exports = state => (cron, event) => {
  if (event.state) return cron // this is the state, not a real event
  if (!forState(state)(event)) return cron
  const pairs = []
  if (!cron.length) { // first time round
    if (state) cron.push(`# state #${state} so not including all events`)
    pairs.push([`0 4 * * *`, `${schedule} # and auto schedule the schedule`])
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
  return cron.concat(pairs.map(addBoilerplate))
}
