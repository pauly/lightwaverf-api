const fs = require('fs')
const { join, resolve } = require('path')
const keyPath = resolve(__dirname, '..', '..', 'config', 'keys')

module.exports = (key, callback) => {
  if (!key) return callback(new Error('missing key'))
  return fs.access(join(keyPath, key), fs.F_OK, callback)
}

