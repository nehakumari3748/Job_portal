Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    Starting CareerNexus Java 21 Job Portal" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

Write-Host "[1/2] Compiling Java backend sources..." -ForegroundColor Yellow
javac -encoding UTF-8 -d bin src\main\java\com\jobportal\SimpleJson.java src\main\java\com\jobportal\model\Job.java src\main\java\com\jobportal\model\Application.java src\main\java\com\jobportal\model\User.java src\main\java\com\jobportal\service\DataStore.java src\main\java\com\jobportal\JobPortalServer.java

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/2] Launching Java HTTP Server on http://localhost:8080 ..." -ForegroundColor Green
Start-Process "http://localhost:8080"

java -cp bin com.jobportal.JobPortalServer 8080
