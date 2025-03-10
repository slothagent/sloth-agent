#!/bin/bash

# Kill any running instances of the application
echo "Stopping any running instances..."
pkill -f "node.*nest start" || true

# Run the application
echo "Starting the application..."
npm run start:dev 