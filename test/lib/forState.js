const forState = require('../../src/lib/forState')

describe('forState', () => {
  it('returns a function', () => {
    expect(forState()).to.be.a('function')
  })

  describe('with state', () => {
    it('returns false, (this is a state, not a real event)', () => {
      const state = 'FOO'
      const event = { state: 'BAR' }
      expect(forState(state)(event)).to.be.false()
    })
  })

  describe('when not for this state', () => {
    it('returns false', () => {
      const state = 'FOO'
      const event = { not: ['FOO'] }
      expect(forState(state)(event)).to.be.false()
    })
  })

  describe('when only for another state', () => {
    it('returns false', () => {
      const state = 'FOO'
      const event = { only: ['BAR'] }
      expect(forState(state)(event)).to.be.false()
    })
  })

  describe('when for this state', () => {
    it('returns false', () => {
      const state = 'FOO'
      const event = { only: ['FOO', 'BAR'] }
      expect(forState(state)(event)).to.be.true()
    })
  })

  describe('when not for another state', () => {
    it('returns false', () => {
      const state = 'FOO'
      const event = { not: ['BAR'] }
      expect(forState(state)(event)).to.be.true()
    })
  })

  describe('when no state and not for another state', () => {
    it('returns false', () => {
      const state = null
      const event = { not: ['BAR'] }
      expect(forState(state)(event)).to.be.true()
    })
  })

  describe('when for all states', () => {
    it('returns false', () => {
      const state = 'FOO'
      const event = {}
      expect(forState(state)(event)).to.be.true()
    })
  })
})
