#!/bin/bash

# Start the Backend in the background
echo "🚀 Starting Backend..."
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000 &

# Start the Frontend
echo "💻 Starting Frontend..."
cd ../frontend && npm run dev