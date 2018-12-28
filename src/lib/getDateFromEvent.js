module.exports = (label, event) => {
  const regex = new RegExp('^' + label, 'i')
  return Object.keys(event).reduce((date, key) => {
    if (regex.test(key)) {
      const year = event[key].substr(0, 4) / 1
      const month = (event[key].substr(4, 2) / 1) - 1
      const day = event[key].substr(6, 2) / 1
      const hour = event[key].substr(9, 2) / 1
      const minute = event[key].substr(11, 2) / 1
      date = new Date(year, month, day, hour, minute)
    }
    return date
  }, null)
}
