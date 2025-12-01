# Start Backend Server Script
# This script starts the backend server manually

$ServerPath = "backend-server"
$Port = 3001

Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Yellow

# Check if port is already in use
$connections = netstat -ano | findstr ":$Port"
if ($connections) {
    Write-Host "`n❌ ERROR: Port $Port is already in use!" -ForegroundColor Red
    Write-Host "   Another process is using this port." -ForegroundColor Yellow
    Write-Host "`n   To stop it, run:" -ForegroundColor Cyan
    Write-Host "   .\stop-backend.ps1" -ForegroundColor White
    Write-Host "`n   Or manually:" -ForegroundColor Cyan
    $pids = $connections | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($pid in $pids) {
        Write-Host "   taskkill /PID $pid /F" -ForegroundColor White
    }
    Write-Host ""
    exit 1
}

# Check if directory exists
if (-not (Test-Path $ServerPath)) {
    Write-Host "`n❌ ERROR: Directory '$ServerPath' not found!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Change to server directory and start
Set-Location $ServerPath
Write-Host "   Directory: $PWD" -ForegroundColor Cyan
Write-Host "   Port: $Port" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm start



