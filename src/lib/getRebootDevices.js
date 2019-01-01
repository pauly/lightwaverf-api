const { executable } = require('../../config')
const cronBoilerPlate = require('./cronBoilerPlate')

module.exports = (cron, room) => {
  if (!room || !room.device) return cron
  return room.device.reduce((cron, device) => {
    if (!device.reboot) return cron
    cron.push(cronBoilerPlate(['@reboot', `${executable} ${room.name} ${device.name} ${device.reboot}`]))
    return cron
  }, cron)
}
