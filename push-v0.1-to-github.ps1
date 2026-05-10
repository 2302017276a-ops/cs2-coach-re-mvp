$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/2302017276a-ops/cs2-coach-re-mvp.git"
$Branch = "main"
$CommitMessage = "backup v0.1.0 MVP"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $ProjectDir

function Find-Git {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

$Git = Find-Git
if (-not $Git) {
    Write-Host ""
    Write-Host "Git was not found on this computer." -ForegroundColor Yellow
    Write-Host "Install Git for Windows first:"
    Write-Host "https://git-scm.com/download/win"
    Write-Host ""
    Write-Host "After installing Git, run this script again."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Using Git: $Git" -ForegroundColor Green

if (-not (Test-Path ".git")) {
    & $Git init
}

& $Git branch -M $Branch

$userName = (& $Git config user.name) -join ""
if ([string]::IsNullOrWhiteSpace($userName)) {
    & $Git config user.name "2302017276a-ops"
}

$userEmail = (& $Git config user.email) -join ""
if ([string]::IsNullOrWhiteSpace($userEmail)) {
    & $Git config user.email "2302017276a-ops@users.noreply.github.com"
}

$remote = (& $Git remote) -join "`n"
if ($remote -notmatch "^origin$") {
    & $Git remote add origin $RepoUrl
} else {
    & $Git remote set-url origin $RepoUrl
}

& $Git add index.html styles.css app.js README.md VERSION CHANGELOG.md requirements-dev.txt tools/ollama_dev_chat.py releases/cs2-coach-re-mvp-v0.1.0.zip push-v0.1-to-github.ps1

$status = (& $Git status --porcelain) -join "`n"
if ($status.Trim().Length -eq 0) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
} else {
    & $Git commit -m $CommitMessage
}

Write-Host ""
Write-Host "Pushing to GitHub: $RepoUrl" -ForegroundColor Cyan
Write-Host "If GitHub asks you to sign in, follow the browser or terminal prompt."
Write-Host ""

$pushOutput = & $Git push -u origin $Branch 2>&1
$pushCode = $LASTEXITCODE
if ($pushCode -ne 0) {
    Write-Host ""
    Write-Host "First push failed. Trying to sync remote and push again." -ForegroundColor Yellow
    $pushOutput | ForEach-Object { Write-Host $_ }
    Write-Host ""

    & $Git fetch origin $Branch
    & $Git merge --allow-unrelated-histories --no-edit "origin/$Branch"

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Auto merge failed. Send me a screenshot of the conflict output." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    & $Git push -u origin $Branch
} else {
    $pushOutput | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "Done. Repository:" -ForegroundColor Green
Write-Host "https://github.com/2302017276a-ops/cs2-coach-re-mvp"
Write-Host ""
Read-Host "Press Enter to exit"
