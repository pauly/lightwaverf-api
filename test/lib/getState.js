const getState = require('../../src/lib/getState')

describe('getState', () => {
  const state = 'FOO'

  describe('with state', () => {
    it('returns state', () => {
      const event = { state: 'BAR' }
      expect(getState(state, event)).to.equal('BAR')
    })
  })

  describe('with no state', () => {
    it('returns existing state', () => {
      const event = {}
      expect(getState(state, event)).to.equal('FOO')
    })
  })
})
