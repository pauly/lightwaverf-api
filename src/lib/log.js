module.exports = (type, path, data) => {
  if (typeof data !== 'string') data = JSON.stringify(data)
  console.log((new Date()).toISOString(), type, path, data)
}
