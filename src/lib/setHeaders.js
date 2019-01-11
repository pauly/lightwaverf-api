module.exports = (req, res, next) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS'
  }
  res.set(headers)
  next()
}
