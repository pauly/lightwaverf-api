const { port } = require('../package').config
const express = require('express')
const { readdir, readFileSync, writeFile } = require('fs')
const { join, resolve } = require('path')
const { exec } = require('child_process')
const { parse, stringify } = require('yaml')
const uuid = require('uuid')
const dgram = require('dgram')
const server = dgram.createSocket('udp4')
const client = dgram.createSocket('udp4')
const { waterfall } = require('async')
const { accesslog, authorised, convertStatus, log, logger, setHeaders, urlencodedParser } = require('./lib')
const listeners = {}
let usage = 0
let today = 0
let max = 0
let messageId = 0

const send = (cmd, callback, backoff) => {
  const id = '' + messageId++
  const message = Buffer.from(id + ',' + cmd, 'ascii')
  log('➡️', '', '' + message)
  client.send(message, 0, message.length, 9760, host || '255.255.255.255')
  if (callback) listeners[id] = { cmd, callback, backoff }
}

const configFile = resolve(process.env.HOME, 'lightwaverf-config.yml')
const { sequence, room, host } = parse(readFileSync(configFile, 'utf8'))
const config = { sequence, room, host }

server.on('message', function (msg) {
  const regex = /^(\d+),(.+)/
  if (regex.test(msg) && regex.exec(msg)) {
    const id = '' + RegExp.$1
    let response = RegExp.$2
    let error = null
    if (/^err/i.test(response)) {
      error = response
      response = null
    }
    const listener = listeners[id] || {}
    const callback = listener.callback
    if (callback) {
      if (/^err,6/i.test(error)) {
        const backoff = (listener.backoff || 0) + 200
        const cmd = listener.cmd
        setTimeout(() => {
          send(cmd, callback, backoff)
        }, backoff)
      } else {
        callback(error, response)
      }
    }
    delete listeners[id]
    log(error ? '👎' : '👍', '', error || response)
    return
  }
  if (/^\*!({.*})/.exec(msg)) {
    msg = JSON.parse(RegExp.$1)
    const timestamp = (new Date()).toISOString()
    if (msg.type === 'energy') {
      usage = msg.cUse
      today = msg.todUse
      max = msg.trans
      logger.log({ level: 'info', message: { usage, max, today }, timestamp })
      return
    }
    if (msg.type === 'hub') {
      if (config.host === msg.ip) return
      config.host = msg.ip
      log('💾', '', config.host)
      writeFile(configFile, stringify(config), 'utf8', err => {
        if (err) console.error(err)
      })
      return
    }
  }
  log('⬅️', '', msg)
})

server.on('listening', function () {
  const address = server.address()
  log('☀️', '', address)
})

server.bind(9761)
// setInterval(() => send('@?W'),600000) // energy

// send('!R1Fa') // register / firmware
send('!R1F*L')

const app = express()

const keyPath = resolve(__dirname, '..', 'config', 'keys')
exec(`mkdir -p ${keyPath}`, function (error, stderr) {
  if (error || stderr) console.error(`Error creating ${keyPath}`, error || stderr)
})

const auth = function (req, res, next) {
  if (req.path === '/user') return next()
  authorised(req.query.key, function (error) {
    if (error) return res.status(401).json({ error: 'not authorised, see paul' })
    next()
  })
}

app.all('*', accesslog, auth, setHeaders)

app.get('/config', function (req, res) {
  config.url = 'http://' + req.hostname
  res.json(config)
})

const operate = function (roomName, deviceName, status, callback) {
  roomName = ('' + roomName).replace(/\W/g, '')
  const rooms = config.room
  const room = rooms.find(room => room.name === roomName)
  if (!room) return callback(new Error('no such room'))
  deviceName = ('' + deviceName).replace(/\W/g, '')
  status = ('' + (status || 'on')).replace(/\W/g, '')
  const f = convertStatus(status)
  const r = rooms.findIndex(room => room.name === roomName) + 1 // @todo fix looking this up twice
  if (deviceName === 'all') {
    if (status === 'off') {
      room.device.forEach(device => {
        device.status = f
      })
      // log('💾', '', room)
      return send(`!R${r}Fa`, (err, response) => {
        if (err) return callback(err)
        writeFile(configFile, stringify(config), 'utf8', err => {
          if (err) console.error(err)
          callback(null, response)
        })
      })
    }
    const tasks = room.device.map(device => {
      return callback => {
        const randomTime = Math.floor(Math.random() * 200) + 100
        setTimeout(() => {
          operate(roomName, device.name, status, err => {
            return callback(err)
          })
        }, randomTime)
      }
    })
    return waterfall(tasks, error => callback(error))
  }
  const device = room.device.find(device => device.name === deviceName)
  if (!device) return callback(new Error('no such device'))
  const d = room.device.findIndex(device => device.name === deviceName) + 1
  const code = '!R' + r + 'D' + d + f // + '|' + room.name + ' ' + device.name + '|' + status + ' via @pauly'
  device.status = f
  send(code, (err, response) => {
    if (err) return callback(err)
    // log('💾', '', room)
    writeFile(configFile, stringify(config), 'utf8', err => {
      if (err) console.error(err)
      callback(null, response)
    })
  })
}

app.put('/register', function (req, res) {
  send('!F*p', function (error, result) {
    if (error) return res.status(400).json({ error })
    res.json({ result })
  })
})

app.put('/room/:room/:device', function (req, res) {
  operate(req.params.room, req.params.device, req.query.status, function (error, result) {
    if (error) return res.status(400).json({ error })
    res.json({ result })
  })
})

app.get('/room/:room', function (req, res) {
  const roomName = req.params.room.replace(/\W/g, '')
  const rooms = config.room
  const room = rooms.find(room => room.name === roomName)
  if (!room) {
    const error = 'no such room'
    return res.status(404).json({ error, rooms })
  }
  res.json(room)
})

const getSequence = sequenceName => {
  sequenceName = ('' + sequenceName).replace(/\W/g, '')
  return config.sequence[sequenceName]
}

app.put('/sequence/:sequence', (req, res) => {
  const sequence = getSequence(req.params.sequence)
  if (!sequence) {
    const error = 'no such sequence'
    return res.status(404).json({ error })
  }
  res.json(sequence) // optimistically callback, don't block by waiting
  const tasks = sequence.map(task => {
    return callback => {
      if (task[0] === 'pause') {
        return setTimeout(() => {
          callback(null)
        }, task[1] * 1000)
      }
      operate(task[0], task[1], task[2], err => {
        return callback(err)
      })
    }
  })
  waterfall(tasks, error => {
    if (error) log('🤔', '', { error })
  })
})

app.get('/sequence/:sequence', (req, res) => {
  const sequence = getSequence(req.params.sequence)
  if (!sequence) {
    const error = 'no such sequence'
    return res.status(404).json({ error })
  }
  res.json(sequence)
})

app.get('/energy', (req, res) => {
  log('⚡️', '', { usage, today })
  res.json({ usage, today })
})

app.post('/user', urlencodedParser, (req, res) => {
  const key = uuid.v4()
  const content = JSON.stringify(req.body)
  readdir(keyPath, (error, files) => {
    if (error) return res.status(500).json({ error })
    // if we are the first key to be created, you get it free!
    // else create a . file that someone has to authorise
    const file = files.length === 0 ? key : '.' + key
    writeFile(join(keyPath, file), content, error => {
      if (error) return res.status(500).json({ error })
      res.json({ key, content })
    })
  })
})

app.all('*', (req, res) => {
  res.json({ GET: ['/room', '/sequence', '/energy'], POST: ['/user'] })
})

app.listen(port)
