#!/usr/bin/env node
const { resolve } = require('path')
const { load } = require('yml')
const { getEvents, getState, todayOnly, tokeniseEvent } = require('../src/lib')

const { calendar } = load(resolve(process.env.HOME, 'lightwaverf-config.yml')) || {}

getEvents(calendar, (err, allEvents) => {
  const events = allEvents.map(tokeniseEvent)
    .filter(todayOnly)
  const cron = []
  const id = 'lwrf_cron'
  const executable = '@todo'
  cron.push(`# ${id} new crontab added by ${process.argv.join(' ')}`)

  console.log(events.slice(0, 3))
  const state = events.reduce(getState, null)
  if (state) cron.push(`# we have state modifier "${state}" so not including all events ${id}`)

  events.forEach(event => {
    if (event.type === 'state') return
    // event = self.get_modifiers event, debug

        match = /UNTIL=(\d+)/.match(event.rrule.to_s)
        if match
          endDate = DateTime.parse(match[1].to_s)
        end
       
        match = /FREQ=(\w+);COUNT=(\d+)/.match(event.rrule)
        # FREQ=DAILY;COUNT=8 - need to check for weekly, monthly etc
        if match
          endDate = event.date + match[2].to_i
        end
    
        if !event.rrule
          endDate = event.date
        end

        if endDate
          next if endDate < Date.today
        end

        unless event.when_modifiers.empty?
            unless event.when_modifiers.include?(state)
            debug and ( p state + ' not in when modifiers for ' + event.to_s + ' so skipping' )
            next
          end
        end
        if event.unless_modifiers.include?(state)
          debug and ( p state + ' is in unless modifiers ' + event.to_s + ' so skipping' )
          next
        end

        if event.type == 'device' and event.state != 'on' and event.state != 'off'
          event.room = 'sequence' if event.room.nil?
            crontab << self.cron_entry(event, executable)
          end_event = event.dup # duplicate event for start and end
          end_event.date = event.end
          end_event.state = 'off'
          crontab << self.cron_entry(end_event, executable)
        else
            event.room = 'sequence' if event.room.nil?
              crontab << self.cron_entry(event, executable, true)
        end

      end
      self.update_cron(crontab, id)
    end
  console.log(cron.join('\n'))
})
