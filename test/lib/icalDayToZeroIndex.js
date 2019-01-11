const icalDayToZeroIndex = require('../../src/lib/icalDayToZeroIndex')

describe('icalDayToZeroIndex', () => {
  it('returns 0 for Sunday', () => {
    expect(icalDayToZeroIndex('SU')).to.equal(0)
  })

  it('returns 1 for Monday', () => {
    expect(icalDayToZeroIndex('MO')).to.equal(1)
  })

  it('returns 6 for Saturday', () => {
    expect(icalDayToZeroIndex('SA')).to.equal(6)
  })
})
