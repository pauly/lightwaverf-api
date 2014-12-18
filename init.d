#!/bin/sh

#!/usr/bin/env ruby
#
# app_name      This is a startup script for use in /etc/init.d 
# 
# chkconfig:    2345 80 20 
# description:  Description of program / service  
# APP_NAME = 'app_name'  
# case ARGV.first     
#   when 'status':     	   
#     status = 'stopped'         
#     puts "#{APP_NAME} is #{status}"
#   when 'start': 		# Do your thang
#   when 'stop': 		# Do your thang
#   when 'restart': 		# Do your thang		
#   else
#     puts "Usage: #{APP_NAME} {start|stop|restart}"
#     exit 
# end

# init.d file
# so copy this file to /etc/init.d/lightwaverf-api and restart your pi
# requires ruby
# see https://github.com/pauly/lightwaverf-api

ROOT_DIR="/home/pi/lightwaverf-api"
SERVER="$ROOT_DIR/lightwaverf-api.rb"
LOG_FILE="$ROOT_DIR/api.log"
CONFIG_FILE="$ROOT_DIR/config/default.sh"
LIGHTWAVERF_API_PORT=80

# LOCK_FILE="/var/lock/lightwaverf-api"

do_start() {
  # if [ ! -f "$LOCK_FILE" ] ; then
    echo -n $"Starting $SERVER: "
    if [ -f "$CONFIG_FILE" ] ; then
      . $CONFIG_FILE
    else
      echo "config file $CONFIG_FILE is missing..."
    fi
    $SERVER -p $LIGHTWAVERF_API_PORT -e production > $LOG_FILE 2>&1
    RETVAL=$?
    # echo
    # [ $RETVAL -eq 0 ] && touch $LOCK_FILE
  # else
    # echo "$SERVER is locked ($LOCK_FILE)."
    # RETVAL=1
  # fi
}

do_stop() {
  echo -n $"Stopping $SERVER: "
  pid=`ps -aefw | grep $SERVER | grep -v " grep " | awk '{print $2}'`
  kill -9 $pid > /dev/null 2>&1
  RETVAL=$?
  # [ $RETVAL -eq 0 ] && rm -f $LOCK_FILE
}

case "$1" in
  start)
    do_start
    ;;
  stop)
    do_stop
    ;;
  restart)
    do_stop
    do_start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    RETVAL=1
esac
exit $RETVAL
