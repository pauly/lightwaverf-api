#!/usr/bin/env node
const { port } = require('../package').config
const { resolve } = require('path')
const { put } = require('request')
const { readdir } = require('fs')

const host = process.env.LIGHTWAVERF_HOST || 'localhost'
const keyPath = resolve(__dirname, '..', 'config', 'keys')
const args = process.argv.slice(2)
let status = 'on'
switch (args[0]) {
  case 'register':
  case 'energy':
  case 'sequence':
    break
  default:
    if (args.length === 3) status = args.pop()
    args.unshift('room')
}
readdir(keyPath, (err, files) => {
  if (err) throw err
  const key = files[0] /// any key will do
  const url = `http://${host}:${port}/${args.join('/')}?key=${key}&status=${status}`
  put(url, (err, response, body) => {
    console.log(url, err || body)
  })
})
