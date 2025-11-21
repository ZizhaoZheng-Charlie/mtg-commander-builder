# PowerShell script to build and deploy Electron app to desktop
# Usage: .\build-and-deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "[*] Starting build and deploy process..." -ForegroundColor Cyan

# Get project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host ""
Write-Host "[*] Running npm run build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Build completed successfully!" -ForegroundColor Green

# Run deployment script
Write-Host ""
Write-Host "[*] Deploying to desktop..." -ForegroundColor Yellow
& "$projectRoot\deploy.ps1"
