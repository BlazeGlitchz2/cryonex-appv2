#!/bin/bash

# Vly Git Sync Project Setup Script
# Project: Cryonex Workspace
# This script will set up your local development environment

set -e  # Exit on error

echo '🚀 Starting Vly project setup...'

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo '❌ Error: Node.js is not installed.'
    echo 'Please install Node.js from https://nodejs.org/'
    exit 1
fi
echo '✅ Node.js is installed'

# Enable pnpm via corepack
echo 'Enabling pnpm...'
corepack enable
corepack prepare pnpm@latest --activate
echo '✅ pnpm is enabled'

# Install dependencies
echo 'Installing dependencies...'
pnpm install
echo '✅ Dependencies installed'

# Setup Convex
echo 'Setting up Convex...'
if [ ! -f .env.local ]; then
    echo '⚠️  Warning: .env.local file not found.'
    echo 'Please download it from the Vly dashboard and place it in the project root.'
fi

# Initialize Convex (if not already initialized)
if [ ! -d 'convex/_generated' ]; then
    echo 'Initializing Convex...'
    npx convex dev --once
fi
echo '✅ Convex is set up'

# Set up backend environment variables
if [ -f setup-backend-env.sh ]; then
    echo 'Setting up backend environment variables...'
    chmod +x setup-backend-env.sh
    ./setup-backend-env.sh
else
    echo '⚠️  Warning: setup-backend-env.sh not found.'
    echo 'Please download it from the Vly dashboard to set up backend environment variables.'
fi

echo ''
echo '🎉 Setup complete!'
echo ''
echo 'To start the development server, run:'
echo '  pnpm dev'
echo ''
echo 'Or run frontend and backend separately:'
echo '  pnpm dev:frontend  # In one terminal'
echo '  pnpm dev:backend   # In another terminal'
