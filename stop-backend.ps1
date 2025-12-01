# Stop Backend Server Script
# This script stops any processes using port 3001

$Port = 3001
Write-Host "`n🛑 Stopping Backend Server (Port $Port)..." -ForegroundColor Yellow

# Find processes using the port
$connections = netstat -ano | findstr ":$Port"

if ($connections) {
    $processIds = $connections | ForEach-Object { 
        ($_ -split '\s+')[-1] 
    } | Select-Object -Unique
    
    foreach ($pid in $processIds) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  Stopping PID $pid ($($process.ProcessName))..." -ForegroundColor Cyan
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    
    Start-Sleep -Seconds 1
    
    # Verify they're stopped
    $stillRunning = netstat -ano | findstr ":$Port"
    if ($stillRunning) {
        Write-Host "`n⚠️  Some processes may still be running" -ForegroundColor Red
        Write-Host "   You may need to stop them manually" -ForegroundColor Yellow
    } else {
        Write-Host "`n✅ All backend processes stopped!" -ForegroundColor Green
        Write-Host "   Port $Port is now available" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n✅ No processes found on port $Port" -ForegroundColor Green
    Write-Host "   Backend server is not running" -ForegroundColor Cyan
}

Write-Host ""



