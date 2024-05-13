#!/bin/bash

set -e

source .env

# decode session from env
if [ -z "$SESSION" ]; then
	echo "❌ SESSION environment variable is not set!"
	exit 1
fi

echo $SESSION | base64 -d > state/session

ls -la state
stat state/session

# run
fastapi ${COMMAND:-"run"} py/api.py --port $PORT --host $HOST
