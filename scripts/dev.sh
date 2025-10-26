#!/bin/bash

# Development script to run all services
echo "🚀 Starting ColdEmail.AI development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "📋 Copy .env.example to .env.local and fill in your credentials"
    exit 1
fi

# Start Next.js dev server
echo "▶️  Starting Next.js dev server..."
npm run dev
