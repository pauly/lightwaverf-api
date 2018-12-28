module.exports = event => {
  // @todo state has two meanings here I think
  // @todo and what is modifier?
  if (/^#/.test(event.command[0])) {
    event.type = 'state' // temporary type, will be overridden later
    event.state = event.command.shift().substr(1)
    return event
  }
  if (event.command[0] === 'mood') {
    event.type = event.command.shift()
    event.room = event.command.shift()
    event.status = event.command.shift()
    return event
  }
  if (event.command[0] === 'sequence') {
    event.type = event.command.shift()
    event.status = event.command.shift()
    return event
  }
  event.type = 'device'
  event.room = event.command.shift()
  event.device = event.command.shift()
  if (/^\w/.test(event.command[0])) event.status = event.command.shift()
  return event
}
