module.exports = (type, path, data) => {
  if (typeof data !== 'string') data = JSON.stringify(data)
  console.info((new Date()).toISOString(), type, path, data)
}
