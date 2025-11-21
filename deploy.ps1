# PowerShell script to deploy Electron app to desktop (assumes build is already done)
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "[*] Deploying app to desktop..." -ForegroundColor Cyan

# Get project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Get version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version

# Get desktop path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$appName = "MTG Commander Builder"
$desktopAppPath = Join-Path $desktopPath $appName
$releasePath = Join-Path $projectRoot "release\$version\win-unpacked"
$exePath = Join-Path $releasePath "MTG Commander Builder.exe"

# Check if release folder exists
if (-not (Test-Path $releasePath)) {
    Write-Host "[X] Release folder not found: $releasePath" -ForegroundColor Red
    Write-Host "   Please run 'npm run build' first." -ForegroundColor Yellow
    exit 1
}

# Check if executable exists
if (-not (Test-Path $exePath)) {
    Write-Host "[X] Executable not found: $exePath" -ForegroundColor Red
    Write-Host "   Please run 'npm run build' first." -ForegroundColor Yellow
    exit 1
}

Write-Host "[*] Copying app to desktop..." -ForegroundColor Yellow

# Remove existing desktop app if it exists
if (Test-Path $desktopAppPath) {
    Write-Host "   Removing existing app from desktop..." -ForegroundColor Gray
    Remove-Item -Path $desktopAppPath -Recurse -Force
}

# Copy the unpacked app to desktop
Write-Host "   Copying files to desktop..." -ForegroundColor Gray
Copy-Item -Path $releasePath -Destination $desktopAppPath -Recurse -Force

Write-Host "[OK] App copied to desktop: $desktopAppPath" -ForegroundColor Green

# Create shortcut on desktop
$shortcutPath = Join-Path $desktopPath "$appName.lnk"
$desktopExePath = Join-Path $desktopAppPath "MTG Commander Builder.exe"

Write-Host "[*] Creating desktop shortcut..." -ForegroundColor Yellow

# Remove existing shortcut if it exists
if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force
}

# Create shortcut using WScript
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $desktopExePath
$Shortcut.WorkingDirectory = $desktopAppPath
$Shortcut.Description = "MTG Commander Builder"
$Shortcut.Save()

Write-Host "[OK] Shortcut created: $shortcutPath" -ForegroundColor Green

Write-Host ""
Write-Host "[SUCCESS] Deployment complete!" -ForegroundColor Cyan
Write-Host "   App location: $desktopAppPath" -ForegroundColor Gray
Write-Host "   Shortcut: $shortcutPath" -ForegroundColor Gray
