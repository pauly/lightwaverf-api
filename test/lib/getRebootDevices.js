const getRebootDevices = require('../../src/lib/getRebootDevices')

/* module.exports = (cron, room) => {
  return room.device.reduce((cron, device) => {
    cron.push(cronBoilerPlate(['@reboot', `${executable} ${room.name} ${device.name} ${device.reboot}`]))
    return cron
  }, cron) */
describe('getRebootDevices', () => {
  let cron = null

  beforeEach(() => {
    cron = ['CRON']
  })

  describe('with no room', () => {
    it('does nothing', () => {
      expect(getRebootDevices(cron)).to.deep.equal(['CRON'])
    })
  })

  describe('with no device', () => {
    it('does nothing', () => {
      expect(getRebootDevices(cron, {})).to.deep.equal(['CRON'])
    })
  })

  describe('with no reboot devices', () => {
    it('does nothing', () => {
      expect(getRebootDevices(cron, { device: [] })).to.deep.equal(['CRON'])
    })
  })

  describe('with reboot devices', () => {
    it('adds to the cron tab array', () => {
      expect(getRebootDevices(cron, { name: 'foo', device: [ { name: 'bar', reboot: true } ] })).to.be.an('array')
        .that.has.length(2)
        .and.that.has.property(1).that.matches(/ foo bar /)
    })
  })
})
