#!/bin/bash

set -e

# Expect the script to be executable.
# load-session.sh
# ! Skip login for now.

# run
/root/.bun/bin/bun run src/job.ts
