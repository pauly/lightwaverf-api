const tokeniseEvent = require('../../src/lib/tokeniseEvent')

describe('tokeniseEvent', () => {
  let result = null
  let event = null

  beforeEach(() => {
    sandbox.stub(console, 'warn')
    event = {
      summary: 'our light on (do not annotate, random 5)',
      component: [
        'vevent',
        [
          [
            'dtstart',
            {
              'tzid': 'Europe/London'
            },
            'date-time',
            '2018-12-10T19:30:00'
          ],
          [
            'dtend',
            {
              'tzid': 'Europe/London'
            },
            'date-time',
            '2018-12-10T22:00:00'
          ],
          [
            'rrule',
            {},
            'recur',
            {
              'freq': 'DAILY'
            }
          ]
        ]
      ]
    }
  })

  afterEach(() => sandbox.restore())

  describe('with bad data', () => {
    beforeEach(() => {
      event.component = 'oops'
      result = tokeniseEvent(event)
    })

    it('returns something anyway', () => {
      expect(result).to.have.property('summary')
        .that.equals(event.summary)
    })

    it('warns us', () => {
      expect(console.warn).to.have.been.calledOnce()
    })
  })

  describe('with do not annotate comment', () => {
    beforeEach(() => {
      result = tokeniseEvent(event)
    })

    it('does not add annotate property', () => {
      expect(result).to.have.property('annotate')
        .that.is.false()
    })
  })

  describe('without do not annotate comment', () => {
    beforeEach(() => {
      event.summary = 'foo'
      result = tokeniseEvent(event)
    })

    it('adds annotate property true', () => {
      expect(result).to.have.property('annotate')
        .that.is.true()
    })
  })

  describe('when summary has state modifiers', () => {
    beforeEach(() => {
      event.summary = 'foo @bar !baz @etc'
      result = tokeniseEvent(event)
    })

    it('adds "only" modifiers', () => {
      expect(result).to.have.property('only')
        .that.deep.equals(['bar', 'etc'])
    })

    it('adds "not" modifiers', () => {
      expect(result).to.have.property('not')
        .that.deep.equals(['baz'])
    })
  })

  describe('when summary has time modifier', () => {
    describe('with no unit', () => {
      beforeEach(() => {
        event.summary = 'foo bar +5'
        result = tokeniseEvent(event)
      })

      it('adds that many minutes to start time', () => {
        expect(result.date.getMinutes()).to.equal(35)
      })

      it('adds that many minutes to end time', () => {
        expect(result.end.getMinutes()).to.equal(5)
      })
    })

    describe('with unit m', () => {
      beforeEach(() => {
        event.summary = 'foo bar +5m'
        result = tokeniseEvent(event)
      })

      it('adds that many minutes to start time', () => {
        expect(result.date.getMinutes()).to.equal(35)
      })

      it('adds that many minutes to end time', () => {
        expect(result.end.getMinutes()).to.equal(5)
      })

      it('kept start date the same day', () => {
        expect(result.date.getDate(), result.date).to.equal(10)
      })

      it('kept end date the same day', () => {
        expect(result.end.getDate(), result.date).to.equal(10)
      })
    })

    describe('with unit h', () => {
      beforeEach(() => {
        event.summary = 'foo bar +2h'
        result = tokeniseEvent(event)
      })

      it('adds no minutes to start time', () => {
        expect(result.date.getMinutes()).to.equal(30)
      })

      it('adds no minutes to end time', () => {
        expect(result.end.getMinutes()).to.equal(0)
      })

      it('adds that many hours to start time', () => {
        expect(result.date.getHours(), result.date).to.equal(21)
      })

      it('adds that many hours to end time', () => {
        expect(result.end.getHours(), result.date).to.equal(0)
      })

      it('kept start date the same day', () => {
        expect(result.date.getDate(), result.date).to.equal(10)
      })

      it('flipped end date to the next day', () => {
        expect(result.end.getDate(), result.date).to.equal(11)
      })
    })
  })

  describe('when summary actually is a state', () => {
    beforeEach(() => {
      event.summary = '#foo bar'
      result = tokeniseEvent(event)
    })

    it('sets state', () => {
      expect(result).to.have.property('state')
        .that.equals('foo')
    })

    it('does not set a room property', () => {
      expect(result).not.to.have.property('room')
    })

    it('does not set a device property', () => {
      expect(result).not.to.have.property('device')
    })

    it('does not set a mood property', () => {
      expect(result).not.to.have.property('mood')
    })

    it('does not set a sequence property', () => {
      expect(result).not.to.have.property('sequence')
    })
  })

  describe('when summary is a device with a status', () => {
    beforeEach(() => {
      event.summary = 'foo bar etc'
      result = tokeniseEvent(event)
    })

    it('does not set state', () => {
      expect(result).not.to.have.property('state')
    })

    it('sets a room property', () => {
      expect(result).to.have.property('room')
        .that.equals('foo')
    })

    it('sets a device property', () => {
      expect(result).to.have.property('device')
        .that.equals('bar')
    })

    it('sets a status property', () => {
      expect(result).to.have.property('status')
        .that.equals('etc')
    })

    it('does not set a mood property', () => {
      expect(result).not.to.have.property('mood')
    })

    it('does not set a sequence property', () => {
      expect(result).not.to.have.property('sequence')
    })
  })

  describe('when summary is a sequence', () => {
    beforeEach(() => {
      event.summary = 'sequence foo (something else)'
      result = tokeniseEvent(event)
    })

    it('does not set state', () => {
      expect(result).not.to.have.property('state')
    })

    it('sets a sequence property', () => {
      expect(result).to.have.property('sequence')
        .that.equals('foo')
    })

    it('does not set a room property', () => {
      expect(result).not.to.have.property('room')
    })

    it('does not set a device property', () => {
      expect(result).not.to.have.property('device')
    })

    it('does not set a status property', () => {
      expect(result).not.to.have.property('status')
    })

    it('does not set a mood property', () => {
      expect(result).not.to.have.property('mood')
    })
  })

  describe('when summary is a mood', () => {
    beforeEach(() => {
      event.summary = 'mood foo bar (something else)'
      result = tokeniseEvent(event)
    })

    it('does not set state', () => {
      expect(result).not.to.have.property('state')
    })

    it('sets a mood property', () => {
      expect(result).to.have.property('mood')
        .that.equals('foo')
    })

    it('sets a room property', () => {
      expect(result).to.have.property('room')
        .that.equals('bar')
    })

    it('does not set a device property', () => {
      expect(result).not.to.have.property('device')
    })

    it('does not set a status property', () => {
      expect(result).not.to.have.property('status')
    })

    it('does not set a sequence property', () => {
      expect(result).not.to.have.property('sequence')
    })
  })
})
