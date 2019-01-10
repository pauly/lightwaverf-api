const log = require('./log')

module.exports = (req, res, next) => {
  next()
  const { key, _, ...query } = req.query
  if (req.method === 'OPTIONS') return // not interesting logging
  if (req.path === '/favicon.ico') return // not interesting logging
  log(req.method, req.path, query)
}

