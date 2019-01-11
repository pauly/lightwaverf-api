const setHeaders = require('../../src/lib/setHeaders')

describe('setHeaders', () => {
  let callback = null
  let res = null

  beforeEach(() => {
    callback = sandbox.stub()
    res = {
      set: sandbox.stub()
    }
    setHeaders('req', res, callback)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('continues', () => {
    expect(callback).to.have.been.calledOnce()
      .and.calledWithExactly()
  })

  it('sets headers', () => {
    expect(res.set).to.have.been.calledOnce()
  })
})
