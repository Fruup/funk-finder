#!/bin/bash

# RUN_MODE = "one-off" | "sleep" | null

set -e

if [[ "$RUN_MODE" == "one-off" ]]; then
	docker-job.sh
else
	sleep infinity
fi
