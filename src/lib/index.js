const dirname = __dirname
const filter = /^(?!index)(.+?)\.js$/
module.exports = require('require-all')({ dirname, filter })
