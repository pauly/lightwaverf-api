#!/usr/bin/env node
const { resolve } = require('path')
const { readFileSync, writeFile } = require('fs')
const { createInterface } = require('readline')
const { parse, stringify } = require('yaml')
const { update } = require('../config')
const { runSchedule } = require('../src/lib')

const configFile = resolve(process.env.HOME, 'lightwaverf-config.yml')
const config = parse(readFileSync(configFile, 'utf8'))

const input = process.stdin
const output = process.stdout
const rl = createInterface({ input, output })

const getRoomAndDevices = (rooms = [], callback) => {
  rl.question(`?`, input => {
    if (input === '') return callback(null, rooms)
    const roomAndDevices = input.split(/\s+/)
    if (roomAndDevices.length < 2) return callback(null, rooms)
    const name = roomAndDevices.shift()
    let found = false
    const device = roomAndDevices.map(name => {
      return { name, type: 'O' }
    })
    rooms.forEach(room => {
      if (room.name === name) {
        room.device = device
        found = true
      }
    })
    if (!found) rooms.push({ name, device })
    getRoomAndDevices(rooms, callback)
  })
}

rl.question(`What is the ip address of your wifi link? (currently "${config.host}").\nEnter a blank line to broadcast UDP commands (ok to just hit enter here).`, host => {
  if (host !== '') config.host = host
  rl.question(`What is the ip address of your calendar ics file? (currently "${config.calendar}" - ok to just hit enter here).`, calendar => {
    if (calendar !== '') config.calendar = calendar
    console.log(`Enter the name of a room and its devices, space separated. For example "lounge light socket tv". Enter a blank line to finish.`)
    console.log(`If you want spaces in room or device name, wrap them in quotes. For example "\'living room' 'tv' 'table lamp\'"`)
    console.log(`If you already have rooms and devices set up on another lightwaverf app then hit enter here, and "${update}" first.`)
    getRoomAndDevices(config.room, (err, rooms) => {
      if (!err) config.room = rooms
      writeFile(configFile, stringify(config), 'utf8', err => {
        if (err) console.error(err)
        if (!config.calendar) return rl.close()
        rl.question(`Run schedule now? [Y/n]`, input => {
          rl.close()
          if (input.substr(0, 1).toLowerCase() === 'n') return
          runSchedule(err => {
            if (err) return console.error(err)
            console.log(`👍 done!`)
          })
        })
      })
    })
  })
})
