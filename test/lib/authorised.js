const fs = require('fs')
const path = require('path')
const authorised = require('../../src/lib/authorised')

describe('authorised', () => {
  let callback = null

  beforeEach(() => {
    sandbox.stub(fs, 'access').yields(null, 'ok')
    sandbox.stub(path, 'resolve')
    sandbox.stub(path, 'join')
    callback = sandbox.stub()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('with key', () => {
    beforeEach(() => {
      authorised('foo', callback)
    })

    it('resolves', () => {
      expect(path.resolve).to.have.been.calledOnce()
    })

    it('accesses', () => {
      expect(fs.access).to.have.been.calledOnce()
    })

    it('yields', () => {
      expect(callback).to.have.been.calledOnce()
        .and.calledWith(null, 'ok')
    })
  })

  describe('with no key', () => {
    beforeEach(() => {
      authorised(null, callback)
    })

    it('does not resolve', () => {
      expect(path.resolve).not.to.have.been.called()
    })

    it('does not access', () => {
      expect(fs.access).not.to.have.been.called()
    })

    it('yields the error', () => {
      const expected = sandbox.match({ message: 'missing key' })
      expect(callback).to.have.been.calledOnce()
        .and.calledWith(expected)
    })
  })
})
