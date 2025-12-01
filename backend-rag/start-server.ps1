# TestWise RAG Backend Startup Script
Write-Host "🚀 Starting RAG Backend Server..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file. Please add your OPENAI_API_KEY!" -ForegroundColor Yellow
        Write-Host "Edit .env and add: OPENAI_API_KEY=your-key-here" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.example not found. Creating basic .env..." -ForegroundColor Red
        @"
OPENAI_API_KEY=your-openai-api-key-here
PORT=8000
"@ | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "✅ Created .env file. Please add your OPENAI_API_KEY!" -ForegroundColor Yellow
        exit 1
    }
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Install dependencies if needed
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Check if data directory exists
$dataDir = "data"
if (-not (Test-Path $dataDir)) {
    Write-Host "📁 Creating data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

# Start server
Write-Host "`n✅ Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

cd src
uvicorn main:app --host 0.0.0.0 --port 8000 --reload



