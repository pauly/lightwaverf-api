const eventToCron = require('../../src/lib/eventToCron')

/* module.exports = (state, cron, event) => {
  } else if (event.sequence) {
    pairs.push([`${event.date.getMinutes()} ${event.date.getHours()} ${date} ${month} ${day}`, `${executable} sequence ${event.sequence}`])
  } else {
    pairs.push([`# @todo ${JSON.stringify(event)}`])
  }
  return cron.concat(pairs.map(toCron))
} */
describe('eventToCron', () => {
  const state = 'STATE'
  let event = null
  let existingCron = null
  let result = null

  beforeEach(() => {
    event = {
      room: 'my',
      device: 'light',
      date: new Date('2018-12-25:07:00:00'),
      end: new Date('2018-12-25:08:00:00'),
      rrule: {
        freq: 'DAILY'
      }
    }
    existingCron = ['CRON']
  })

  afterEach(() => sandbox.restore())

  describe('with state', () => {
    beforeEach(() => {
      event = { state }
    })

    it('returns existing cron (this is not a real event)', () => {
      expect(eventToCron(state)(existingCron, event)).to.deep.equal(['CRON'])
    })
  })

  describe('when not for this state', () => {
    beforeEach(() => {
      event = { not: [state] }
    })

    it('returns existing cron', () => {
      expect(eventToCron(state)(existingCron, event)).to.deep.equal(['CRON'])
    })
  })

  describe('when for this state', () => {
    describe('first time round', () => {
      beforeEach(() => {
        existingCron = []
        result = eventToCron(state)(existingCron, event)
      })

      describe('when we have a state', () => {
        it('adds a comment regarding state', () => {
          expect(result).to.be.an('array')
            .that.has.property(0)
            .that.matches(/#STATE/)
            .and.that.matches(/not including all events/)
        })

        it('adds itself to the schedule at 4am', () => {
          expect(result).to.be.an('array')
            .that.has.property(1)
            .that.matches(/^0 4 \* \* \*/)
            .and.that.matches(/schedule/)
        })
      })
    })

    describe('with a device', () => {
      describe('that has no status', () => {
        beforeEach(() => {
          result = eventToCron(state)(existingCron, event)
        })

        it('adds an event for the start time', () => {
          expect(result).to.be.an('array')
            .that.has.property(1) // property 0 is our existingCron
            .that.matches(/^0 7 \* \* \* .* my light on/)
        })

        it('adds an event for the end time', () => {
          expect(result).to.be.an('array')
            .that.has.property(2)
            .that.matches(/^0 8 \* \* \* .* my light off/)
        })
      })

      describe('that has a status', () => {
        beforeEach(() => {
          event.status = 'blink'
          result = eventToCron(state)(existingCron, event)
        })

        it('adds an event only for status, using the start time', () => {
          expect(result).to.be.an('array')
            .that.has.property(1) // property 0 is our existingCron
            .that.matches(/^0 7 \* \* \* .* my light blink/)
        })

        it('adds no event for the end time', () => {
          expect(result).to.be.an('array')
            .that.does.not.have.property(2)
        })
      })
    })

    describe('with a repeating event', () => {
      beforeEach(() => {
        event.rrule.freq = 'WEEKLY'
        event.rrule.byday = ['FR', 'SA', 'SU']
      })

      describe('that has no status', () => {
        beforeEach(() => {
          result = eventToCron(state)(existingCron, event)
        })

        it('adds an event for the start time', () => {
          expect(result).to.be.an('array')
            .that.has.property(1) // property 0 is our existingCron
            .that.matches(/^0 7 \* \* 5,6,0 .* my light on/)
        })

        it('adds an event for the end time', () => {
          expect(result).to.be.an('array')
            .that.has.property(2)
            .that.matches(/^0 8 \* \* 5,6,0 .* my light off/)
        })
      })

      describe('that has a status', () => {
        beforeEach(() => {
          event.status = 'blink'
          result = eventToCron(state)(existingCron, event)
        })

        it('adds an event only for status, using the start time', () => {
          expect(result).to.be.an('array')
            .that.has.property(1) // property 0 is our existingCron
            .that.matches(/^0 7 \* \* 5,6,0 .* my light blink/)
        })

        it('adds no event for the end time', () => {
          expect(result).to.be.an('array')
            .that.does.not.have.property(2)
        })
      })
    })

    describe('with a sequence', () => {
      beforeEach(() => {
        delete event.device
        event.sequence = 'flash'
        result = eventToCron(state)(existingCron, event)
      })

      it('adds an event for the sequence, using the start time', () => {
        expect(result).to.be.an('array')
          .that.has.property(1) // property 0 is our existingCron
          .that.matches(/^0 7 \* \* \* .* sequence flash/)
      })

      it('adds no event for the end time', () => {
        expect(result).to.be.an('array')
          .that.does.not.have.property(2)
      })
    })
  })
})
