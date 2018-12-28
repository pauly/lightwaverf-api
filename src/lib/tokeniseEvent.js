const enhanceEventWithType = require('./enhanceEventWithType')
const getDateFromEvent = require('./getDateFromEvent')

module.exports = e => {
  /* 'DTSTART;TZID=Europe/London': '20170913T153000',
          'DTEND;TZID=Europe/London': '20170914T000000',
          RRULE: 'FREQ=WEEKLY;BYDAY=TU,WE',
          DTSTAMP: '20181227T170121Z',
          UID: 'kvef77b15ujh7tvggmhlkebis0@google.com',
          CREATED: '20140816T114901Z',
          DESCRIPTION: '',
          'LAST-MODIFIED': '20181224T233717Z',
          LOCATION: '',
          SEQUENCE: '6',
          STATUS: 'CONFIRMED',
          SUMMARY: 'lounge tv !holiday',
          TRANSP: 'TRANSPARENT' }, */
  const event = {}
  event.summary = e.SUMMARY
  event.command = ('' + e.SUMMARY).split(/ +/)
  event.annotate = !/do not annotate/.test(event.summary)
  event.date = getDateFromEvent('DTSTART', e)
  event.end = getDateFromEvent('DTEND', e)
  if (e.RRULE && e.RRULE.length > 0) {
    event.rrule = e.RRULE
  }
  return enhanceEventWithType(event)
}
