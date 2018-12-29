module.exports = state => {
  return event => {
    if (event.state) return false // this is a state, not a real event
    if (event.not && event.not.includes(state)) return false
    if (event.only && !event.only.includes(state)) return false
    return true
  }
}
