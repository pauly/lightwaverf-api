const convertStatus = require('../../src/lib/convertStatus')

describe('convertStatus', () => {
  it('sets status to turn a device off', () => {
    expect(convertStatus(0)).to.equal('F0')
    expect(convertStatus('0')).to.equal('F0')
    expect(convertStatus('off')).to.equal('F0')
  })

  it('sets status to dim a device full', () => {
    expect(convertStatus('full')).to.equal('FdP32')
    expect(convertStatus('100')).to.equal('FdP32')
    expect(convertStatus(100)).to.equal('FdP32')
  })

  it('sets status to dim a device high', () => {
    expect(convertStatus('high')).to.equal('FdP24')
  })

  it('sets status to dim a device medium', () => {
    expect(convertStatus('mid')).to.equal('FdP16')
  })

  it('sets status to dim a device low', () => {
    expect(convertStatus('low')).to.equal('FdP8')
  })

  it('sets status to a percentage', () => {
    expect(convertStatus('25')).to.equal('FdP8')
    expect(convertStatus(75)).to.equal('FdP24')
  })

  it('sets status to turn a device on (default)', () => {
    expect(convertStatus('on')).to.equal('F1')
    expect(convertStatus('hey')).to.equal('F1')
  })
})
