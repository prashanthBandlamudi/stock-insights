#!/bin/bash

# Start Stock Screener Backend in Virtual Environment
echo "🚀 Starting Stock Screener Backend..."

# Activate virtual environment
source /Users/prashanthbandlamudi/Desktop/cloudcli-env/bin/activate

# Navigate to backend directory  
cd /Users/prashanthbandlamudi/Desktop/personalWork/stock-insights/backend

# Install required packages in venv
echo "📦 Installing required packages..."
pip install flask flask-cors yfinance pandas requests

# Start the Flask server
echo "🌐 Starting Flask server on http://localhost:5001"
python enhanced_screener.py