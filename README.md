# Lightwaverf-api

Simple API to communicate with LightwaveRF home automation hardware.

This used to be all in ruby, there is still a ruby branch in this repo of the original code. Now it's all javascript.

This doesn't even use [the lightwaverf gem](https://github.com/pauly/lightwaverf) any more, but it does share the same format of config file, so you might want that to set up your config initially.

## Setup

Get a LightWaveRF wifi link http://amzn.to/V7yPPK and a remote socket http://amzn.to/RkukDo

Run this code on a machine on your local network, and
```
npm run configure
```
and restart your machine. On reboot the api will be running on port 8000 on this machine. Add a "key" filename in config/keys/ where this lives. For example
```
mkdir -p /home/pi/lightwaverf-api/config/keys/
touch /home/pi/lightwaverf-api/config/keys/SECRET
```
Then
```
GET http://localhost:8000/room?key=SECRET # lists rooms
GET http://localhost:8000/room/foo?key=SECRET # lists devices in room "foo"
PUT http://localhost:8000/room/foo/bar?key=SECRET&status=on # turns device "bar" in room "foo" on
PUT http://localhost:8000/room/foo/bar?key=SECRET&status=off # turns device "bar" in room "foo" off
PUT http://localhost:8000/room/foo/bar?key=SECRET&status=50 # turns device "bar" in room "foo" to 50% brightness
PUT http://localhost:8000/room/foo/all?key=SECRET&status=on # turns all devices in room "foo" on
PUT http://localhost:8000/room/foo/all?key=SECRET&status=off # turns all decies in room "foo" off

GET http://localhost:8000/sequence?key=SECRET # lists sequences
GET http://localhost:8000/sequence/foo?key=SECRET # lists devices controlled in sequence "foo"
PUT http://localhost:8000/sequence/foo?key=SECRET # execute sequence "foo"
```
Some of those have a command line helper too;
```
npm run operate -- foo bar on # turns device "bar" in room "foo" on
npm run operate -- foo bar off # turns device "bar" in room "foo" off
npm run operate -- foo bar 50 # turns device "bar" in room "foo" to 50% brightness
npm run operate -- foo all on # turns all devices in room "foo" on
npm run operate -- foo all off # turns all decies in room "foo" off

npm run operate -- sequence foo # execute sequence "foo"
```

This code is unofficial and unaffiliated with http://www.lightwaverf.com, please let me know how you get on http://www.clarkeology.com/project/lightwaverf / @pauly

## Todo

 * Make it configurable
 * ???
 * Profit
