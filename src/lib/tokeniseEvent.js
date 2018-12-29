module.exports = e => {
  const event = {}
  event.summary = e.summary
  event.command = ('' + e.summary).split(/ +/)
  event.annotate = !/do not annotate/.test(event.summary)
  try {
    event.date = new Date(e.component[1][0][3])
    event.end = new Date(e.component[1][1][3])
    event.rrule = e.component[1][2][3]
  } catch (err) {
    console.warn('problem with component', e.component)
    event.date = new Date()
    event.end = new Date()
    event.rrule = {}
  }
  let match // undefined
  const regex = /([!@])(\w+)/g
  while (match !== null) {
    match = regex.exec(event.summary)
    if (!match) continue
    const property = match[1] === '@' ? 'only' : 'not'
    if (!event[property]) event[property] = []
    event[property].push(match[2])
  }
  if (/random (\d+)/.test(event.summary)) {
    const variance = RegExp.$1 / 1
    event.date.setMinutes(event.date.getMinutes() + Math.random() * variance * 2 - variance)
    event.end.setMinutes(event.end.getMinutes() + Math.random() * variance * 2 - variance)
  }
  if (/([+\-]\d+)(h?)/.test(event.summary)) {
    let modifier = RegExp.$1 / 1
    if (RegExp.$2 === 'h') {
      modifier *= 60 // (so always in minutes)
    }
    event.date.setMinutes(event.date.getMinutes() + modifier)
    event.end.setMinutes(event.end.getMinutes() + modifier)
  }
  // if it starts with a hash it is a state
  if (/^\#/.test(event.summary)) {
    event.state = event.command.shift().substr(1)
  } else if (/^mood\W/.test(event.summary)) {
    event.type = event.command.shift()
    event.room = event.command.shift()
  } else if (/^sequence\W/.test(event.summary)) {
    event.sequence = event.command.shift()
  } else {
    event.room = event.command.shift()
    event.device = event.command.shift()
  }
  // if the next word starts with an alphanumeric it must be a status (on, off, 50% etc)
  if (/^\w/.test(event.command[0])) event.status = event.command.shift()
  return event
}
