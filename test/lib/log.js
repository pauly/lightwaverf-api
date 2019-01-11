const log = require('../../src/lib/log')

describe('log', () => {
  beforeEach(() => {
    sandbox.stub(console, 'info')
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('logs strings', () => {
    log('foo', 'bar', 'etc')
    expect(console.info).to.have.been.calledOnce()
      .and.calledWithExactly(sandbox.match.string, 'foo', 'bar', 'etc')
  })

  it('logs other things', () => {
    log('foo', 'bar', 1)
    expect(console.info).to.have.been.calledOnce()
      .and.calledWithExactly(sandbox.match.string, 'foo', 'bar', '1')
  })
})
