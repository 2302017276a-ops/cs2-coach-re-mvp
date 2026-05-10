$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/2302017276a-ops/cs2-coach-re-mvp.git"
$Branch = "main"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Git = "C:\Program Files\Git\cmd\git.exe"

Set-Location $ProjectDir

if (-not (Test-Path $Git)) {
    $Git = "git"
}

if (-not (Test-Path ".git")) {
    & $Git init
    & $Git branch -M $Branch
}

$remote = (& $Git remote) -join "`n"
if ($remote -notmatch "^origin$") {
    & $Git remote add origin $RepoUrl
} else {
    & $Git remote set-url origin $RepoUrl
}

$userName = (& $Git config user.name) -join ""
if ([string]::IsNullOrWhiteSpace($userName)) {
    & $Git config user.name "2302017276a-ops"
}

$userEmail = (& $Git config user.email) -join ""
if ([string]::IsNullOrWhiteSpace($userEmail)) {
    & $Git config user.email "2302017276a-ops@users.noreply.github.com"
}

$message = Read-Host "Commit message, or press Enter for auto message"
if ([string]::IsNullOrWhiteSpace($message)) {
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "update MVP $stamp"
}

& $Git add -A
$status = (& $Git status --porcelain) -join "`n"
if ($status.Trim().Length -eq 0) {
    Write-Host "No local changes to commit." -ForegroundColor Yellow
} else {
    & $Git commit -m $message
}

Write-Host "Syncing remote..." -ForegroundColor Cyan
& $Git pull origin $Branch --no-edit

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Pull failed. If there are conflicts, send me a screenshot." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Pushing..." -ForegroundColor Cyan
& $Git push -u origin $Branch

Write-Host ""
Write-Host "Done:" -ForegroundColor Green
Write-Host "https://github.com/2302017276a-ops/cs2-coach-re-mvp"
Read-Host "Press Enter to exit"
