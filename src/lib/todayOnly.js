module.exports = (event, from, to) => {
  if (!from) from = new Date()
  if (!to) {
    to = new Date()
    to.setDate(to.getDate() + 1)
  }
  if (event.end < from) return false
  if (event.date > to) return false
  return true
}
