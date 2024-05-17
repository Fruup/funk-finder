#!/bin/bash

set -e

# Expect the script to be executable.
load-session.sh

# run
fastapi ${COMMAND:-"run"} py/api.py --port $PORT --host $HOST
