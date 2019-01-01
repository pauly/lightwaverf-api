#!/usr/bin/env node
const { runSchedule } = require('../src/lib')

runSchedule((err, cron) => {
  if (err) return console.error(err)
  console.log(`👍 done!`, cron)
})
