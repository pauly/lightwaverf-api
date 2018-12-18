const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { load } = require('yml')
const uuid = require('uuid')
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()

const { sequence, room } = load(path.resolve(process.env.HOME, 'lightwaverf-config.yml')) || {}
const config = { sequence, room }

const keyPath = path.resolve(__dirname, '..', 'config', 'keys')

const authorised = (key, callback) => {
  return fs.access(path.join(keyPath, key), fs.F_OK, callback)
}

const log = (req, res, next) => {
  const { key, _, ...query } = req.query
  if (req.method !== 'OPTIONS') console.log((new Date()).toISOString(), req.method, req.path, JSON.stringify(query))
  next()
}

const auth = (req, res, next) => {
  if (req.path === '/user') return next()
  authorised(req.query.key, err => {
    if (err) return res.status(401).json({ error: 'not authorised, see paul' })
    next()
  })
}

const setHeaders = (req, res, next) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS'
  }
  res.set(headers)
  next()
}

app.all('*', log, auth, setHeaders)

app.get('/config', function (req, res) {
  config.url = 'http://' + req.hostname
  res.json(config)
})

app.put('/room/:room/:device', function (req, res) {
  const roomName = req.params.room.replace(/\W/g, '')
  const deviceName = req.params.device.replace(/\W/g, '')
  const status = req.query.status.replace(/\W/g, '') || 'on'
  const rooms = config.room
  const room = rooms.find(room => room.name === roomName)
  if (!room) {
    const error = 'no such room'
    return res.status(404).json({ error, rooms })
  }
  const device = room.device.find(device => device.name === deviceName)
  if (!device) {
    const error = 'no such device'
    return res.status(404).json({ error, device })
  }
  const cmd = `lightwaverf ${roomName} ${deviceName} ${status}`
  exec(cmd, (err, stderr, result) => {
    if (err) return res.status(500).json(err)
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

app.put('/sequence/:sequence', function (req, res) {
  const sequenceName = req.params.sequence.replace(/\W/g, '')
  const sequence = config.sequence[sequenceName]
  if (!sequence) {
    const error = 'no such sequence'
    return res.status(404).json({ error, sequences })
  }
  const cmd = `lightwaverf sequence ${sequenceName}`
  exec(cmd, (err, stderr, result) => {
    if (err) return res.status(500).json(err)
    res.json({ result })
  })
})

app.get('/sequence/:sequence', function (req, res) {
  const sequenceName = req.params.sequence.replace(/\W/g, '')
  const sequence = config.sequence[sequenceName]
  if (!sequence) {
    const error = 'no such sequence'
    return res.status(404).json({ error, sequences })
  }
  res.json(sequence)
})

app.get('/energy', function (req, res) {
  res.json({ error: 'not implemented yet @todo' })
})

app.post('/user', urlencodedParser, function (req, res) {
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

app.all('*', function (req, res) {
  res.json({ GET: ['/room', '/sequence', '/energy'], POST: ['/user'] })
})

app.listen(8000)
