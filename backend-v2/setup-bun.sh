#!/bin/bash

# Install dependencies
echo "Installing dependencies with Bun..."
bun install

# Run the application
echo "Starting the application with Bun..."
bun run start:bun:dev 