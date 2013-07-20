#!/bin/sh

# init.d file
# so copy this file to /etc/init.d/ and restart your pi
# requires node
# see https://github.com/pauly/lightwaverf

ROOT_DIR="/home/pi/lightwaverf-api"
SERVER="$ROOT_DIR/api.rb"
LOG_FILE="$ROOT_DIR/api.log"
CONFIG_FILE="$ROOT_DIR/config/default.sh"

# LOCK_FILE="/var/lock/lightwaverf-api"

do_start() {
  # if [ ! -f "$LOCK_FILE" ] ; then
    echo -n $"Starting $SERVER: "
    if [ -f "$CONFIG_FILE" ] ; then
      . $CONFIG_FILE
    else
      echo "config file $CONFIG_FILE is missing..."
    fi
    $SERVER -p 80 -e production >> $LOG_FILE &
    RETVAL=$?
    echo
    [ $RETVAL -eq 0 ] && touch $LOCK_FILE
  # else
    # echo "$SERVER is locked ($LOCK_FILE)."
    # RETVAL=1
  # fi
}

do_stop() {
  echo -n $"Stopping $SERVER: "
  pid=`ps -aefw | grep "$DAEMON $SERVER" | grep -v " grep " | awk '{print $2}'`
  kill -9 $pid > /dev/null 2>&1
  # RETVAL=$?
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
