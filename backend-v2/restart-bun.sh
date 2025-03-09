#!/bin/bash

# Kill any running instances of the application
echo "Stopping any running instances..."
pkill -f "bun.*--watch" || true

# Run the application
echo "Starting the application with Bun..."
bun run start:bun:dev 