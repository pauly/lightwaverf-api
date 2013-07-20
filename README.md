# Lightwaverf-api

Simple API to communicate with LightwaveRF home automation hardware.

Uses the lightwaverf gem, see https://github.com/pauly/lightwaverf

# Setup

Get a LightWaveRF wifi link http://amzn.to/V7yPPK and a remote socket http://amzn.to/RkukDo

Run this code on a machine on your local network, install ruby and the lightwaverf gem,
edit the file init.d to match your config, then 

    sudo cp init.d /etc/init.d/lightwaverf-api

and restart your machine. On reboot the api will be running on port 80 on this machine. Then

    GET http://localhost/room # lists rooms
    GET http://localhost/room/foo # lists devices in room "foo"
    PUT http://localhost/room/foo/bar?status=on # turns device "bar" in room "foo" on
    PUT http://localhost/room/foo/bar?status=off # turns device "bar" in room "foo" off
    PUT http://localhost/room/foo/bar?status=50 # turns device "bar" in room "foo" to 50% brightness
    PUT http://localhost/room/foo/all?status=on # turns all devices in room "foo" on
    PUT http://localhost/room/foo/all?status=off # turns all decies in room "foo" off

    GET http://localhost/sequence # lists sequences
    GET http://localhost/sequence/foo # lists devices controlled in sequence "foo"
    Put http://localhost/sequence/foo # execute sequence "foo"

This code is unofficial and unaffiliated with http://www.lightwaverf.com, please let me know how you get on http://www.clarkeology.com/wiki/lightwaverf / @pauly

## Todo

 * Package it
 * Make it configurable
 * Add a page that controls the api into the api
 * Make a real phone app
 * ???
 * Proft
