const logger = require('../../src/lib/logger')

describe('logger', () => {
  it('creates a logger', () => {
    expect(logger).to.be.an('object')
  })
})
