#!/bin/bash

# This script loads the session from the environment variable `SESSION`
# and decodes it from base64 to a file.

set -e

# decode session from env
if [ -z "$SESSION" ]; then
	echo "❌ SESSION environment variable is not set!"
	exit 1
fi

mkdir -p state
echo $SESSION | base64 -d > state/session

ls -la state
stat state/session
