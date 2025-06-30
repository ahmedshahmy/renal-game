#!/bin/bash
echo "🏥 Starting Renal Hospital Management Game..."
echo "📂 Directory: $(pwd)"
echo "🌐 Starting local server on port 8000..."
echo "🎮 Game will be available at: http://localhost:8000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start the Python HTTP server
python3 -m http.server 8000
