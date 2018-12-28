const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { load } = require('yml')
const uuid = require('uuid')
const bodyParser = require('body-parser')
const dgram = require('dgram')
const server = dgram.createSocket('udp4')
const client = dgram.createSocket('udp4')
const winston = require('winston')
const { waterfall } = require('async')
const filename = path.resolve(process.env.HOME, 'lightwaverf.log')
const level = 'info'
const listeners = {}
let messageId = 0
let usage = 0
let today = 0
let max = 0

const { sequence, room, host } = load(path.resolve(process.env.HOME, 'lightwaverf-config.yml')) || {}
const config = { sequence, room, host }

const logger = winston.createLogger({
  level,
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename })
  ]
})

const log = function (type, path, data) {
  console.log((new Date()).toISOString(), type, path, JSON.stringify(data))
}

server.on('message', function (msg) {
  const regex = /^(\d+),(.+)/
  if (regex.test(msg) && regex.exec(msg)) {
    const id = '' + RegExp.$1
    let response = RegExp.$2
    let error = null
    const callback = listeners[id]
    if (/^err/i.test(response)) {
      error = response
      response = null
    }
    if (callback) callback(error, response)
    delete listeners[id]
    return
  }
  if (/^\*!({.*})/.exec(msg)) {
    msg = JSON.parse(RegExp.$1)
    const timestamp = (new Date()).toISOString()
    if (msg.type === 'energy') {
      usage = msg.cUse
      today = msg.todUse
      max = msg.trans
      logger.log({ level, message: { usage, max, today }, timestamp})
      return
    }
  }
  log('⬅️', '', msg)
})

const send = function (cmd, callback) {
  const id = '' + messageId++
  const message = Buffer.from(id + ',' + cmd, 'ascii')
  log('➡️', '', { cmd, message: '' + message })
  client.send(message, 0, message.length, 9760, config.host || '255.255.255.255')
  if (callback) listeners[id] = callback
}

server.on('listening', function () {
  const address = server.address()
  log('☀️', '', address)
})
server.bind(9761)
// send('!R1Fa') // register / firmware

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()

const keyPath = path.resolve(__dirname, '..', 'config', 'keys')
exec(`mkdir -p ${keyPath}`, function (error, stderr) {
  if (error || stderr) console.error(`Error creating ${keyPath}`, error || stderr)
})

const authorised = function (key, callback) {
  return fs.access(path.join(keyPath, key), fs.F_OK, callback)
}

const accesslog = function (req, res, next) {
  const { key, _, ...query } = req.query
  if (req.method !== 'OPTIONS') log(req.method, req.path, query)
  next()
}

const auth = function (req, res, next) {
  if (req.path === '/user') return next()
  authorised(req.query.key, function (error) {
    if (error) return res.status(401).json({ error: 'not authorised, see paul' })
    next()
  })
}

const setHeaders = function (req, res, next) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS'
  }
  res.set(headers)
  next()
}

app.all('*', accesslog, auth, setHeaders)

app.get('/config', function (req, res) {
  config.url = 'http://' + req.hostname
  res.json(config)
})

const operate = function (roomName, deviceName, status, callback) {
  roomName = ('' + roomName).replace(/\W/g, '')
  deviceName = ('' + deviceName).replace(/\W/g, '')
  status = ('' + (status || 'on')).replace(/\W/g, '')
  const rooms = config.room
  const room = rooms.find(room => room.name === roomName)
  if (!room) return callback('no such room')
  const r = rooms.findIndex(room => room.name === roomName) + 1
  const device = room.device.find(device => device.name === deviceName)
  if (!device) return callback('no such device')
  const d = room.device.findIndex(device => device.name === deviceName) + 1
  const f = status === 'on' ? 1 : 0
  code = '!R' + r + 'D' + d + 'F' + f + '|' + room.name + ' ' + device.name + '|' + status + ' via @pauly'
  send(code, callback)
}

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
  waterfall(tasks, (error, response) => {
    // log('🤔', '', { error, response })
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
  fs.readdir(keyPath, (error, files) => {
    // if we are the first key to be created, you get it free!
    // else create a . file that someone has to authorise
    const file = files.length === 0 ? key : '.' + key
    fs.writeFile(path.join(keyPath, file), content, error => {
      if (error) return res.status(500).json({ error })
      res.json({ key, content })
    })
  })
})

app.all('*', (req, res) => {
  res.json({ GET: ['/room', '/sequence', '/energy'], POST: ['/user'] })
})

app.listen(8000)
