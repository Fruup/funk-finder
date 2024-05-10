#!/bin/bash

# decode session from env
echo $SESSION | base64 -d > state/session

ls -la state
stat state/session

# run
fastapi run py/api.py --port $PORT --host $HOST
