#!/bin/bash

set -e

# Expect the script to be executable.
load-session.sh

# run
/root/.bun/bin/bun run src/job.ts
