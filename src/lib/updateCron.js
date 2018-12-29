const { name } = require('../../package')
const { exec } = require('child_process')
const { basename } = require('path')
const { writeFile } = require('fs')
const tempFolder = '/tmp'

module.exports = (newEntries, callback) => {
  const id = `${name}-${basename(__filename, '.js').replace(/\W+/g, '-')}`
  exec(`crontab -l`, (err, crontab) => {
    if (err) return callback(err)
    crontab = ('' + crontab).split('\n')
    const tempFileBase = `${tempFolder}/${id}`
    const regex = new RegExp(id)
    newEntries = ('' + newEntries).split('\n')
    newEntries.unshift(`# added by ${__filename} on ${new Date()}, edit at will:`)
    newEntries = newEntries.map(line => `${line} # ${id}`)
    crontab = crontab.filter(line => !regex.test(line))
      .concat(newEntries)
    const tempFile = `${tempFileBase}.tmp`
    writeFile(tempFile, crontab.join('\n'), err => {
      if (err) return callback(new Error(`🙀 failed to write temporary file ${tempFile} (${err})`))
      exec(`crontab ${tempFile}`, err => {
        if (err) return callback(new Error(`🙀 failed to set new cron (${err})`))
        callback(null)
      })
    })
  })
}
