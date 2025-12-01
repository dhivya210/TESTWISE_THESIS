# TestWise Server Management Script
# This script helps you start/stop the backend server

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action = 'status'
)

$Port = 3001
$ServerPath = "backend-server"

function Get-PortProcess {
    $connections = netstat -ano | findstr ":$Port"
    if ($connections) {
        $pid = ($connections[0] -split '\s+')[-1]
        return $pid
    }
    return $null
}

function Stop-Server {
    Write-Host "`nChecking for server on port $Port..." -ForegroundColor Yellow
    $pid = Get-PortProcess
    if ($pid) {
        Write-Host "Found server process (PID: $pid). Stopping..." -ForegroundColor Yellow
        taskkill /PID $pid /F | Out-Null
        Start-Sleep -Seconds 1
        Write-Host "Server stopped successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "No server found on port $Port" -ForegroundColor Gray
        return $false
    }
}

function Start-Server {
    Write-Host "`nStarting server..." -ForegroundColor Yellow
    
    # Check if port is already in use
    $pid = Get-PortProcess
    if ($pid) {
        Write-Host "Port $Port is already in use by process $pid" -ForegroundColor Red
        Write-Host "Use 'stop' or 'restart' to stop it first" -ForegroundColor Yellow
        return $false
    }
    
    if (Test-Path $ServerPath) {
        Push-Location $ServerPath
        Write-Host "Starting server in background..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Minimized
        Start-Sleep -Seconds 2
        
        $newPid = Get-PortProcess
        if ($newPid) {
            Write-Host "Server started successfully! (PID: $newPid)" -ForegroundColor Green
            Write-Host "Server is running at: http://localhost:$Port" -ForegroundColor Cyan
        } else {
            Write-Host "Server may still be starting. Check the window that opened." -ForegroundColor Yellow
        }
        Pop-Location
        return $true
    } else {
        Write-Host "Error: '$ServerPath' directory not found!" -ForegroundColor Red
        return $false
    }
}

function Show-Status {
    Write-Host "`n=== Server Status ===" -ForegroundColor Cyan
    $pid = Get-PortProcess
    if ($pid) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Status: RUNNING" -ForegroundColor Green
            Write-Host "PID: $pid" -ForegroundColor White
            Write-Host "Process: $($process.ProcessName)" -ForegroundColor White
            Write-Host "Port: $Port" -ForegroundColor White
            Write-Host "URL: http://localhost:$Port" -ForegroundColor Cyan
        } else {
            Write-Host "Port $Port is in use but process info unavailable" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Status: NOT RUNNING" -ForegroundColor Red
        Write-Host "Port $Port is available" -ForegroundColor Gray
    }
    Write-Host ""
}

# Main execution
switch ($Action) {
    'start' {
        Start-Server
    }
    'stop' {
        Stop-Server
    }
    'restart' {
        Write-Host "`n=== Restarting Server ===" -ForegroundColor Cyan
        Stop-Server | Out-Null
        Start-Sleep -Seconds 1
        Start-Server
    }
    'status' {
        Show-Status
    }
}



