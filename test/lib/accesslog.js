const accesslog = require('../../src/lib/accesslog')

describe('accesslog', () => {
  let req = null
  let callback = null

  beforeEach(() => {
    callback = sandbox.stub()
    sandbox.stub(console, 'info')
    req = {
      method: 'foo',
      path: '/bar',
      query: { etc: 'etc' }
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('strips OPTIONS', () => {
    req.method = 'OPTIONS'
    accesslog(req, 'res', callback)
    expect(console.info).not.to.have.been.called()
  })

  it('strips favicon', () => {
    req.path = '/favicon.ico'
    accesslog(req, 'res', callback)
    expect(console.info).not.to.have.been.called()
  })

  it('logs other things', () => {
    accesslog(req, 'res', callback)
    expect(console.info).to.have.been.calledOnce()
      .and.calledWithExactly(sandbox.match.string, 'foo', '/bar', '{"etc":"etc"}')
  })
})
