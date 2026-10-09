@echo off
echo =======================================================
echo     Starting CareerNexus Java 21 Job Portal
echo =======================================================

cd /d "%~dp0"

echo [1/3] Creating output directory...
if not exist "bin" mkdir bin

echo [2/3] Compiling Java backend sources...
javac -encoding UTF-8 -d bin src\main\java\com\jobportal\SimpleJson.java src\main\java\com\jobportal\model\Job.java src\main\java\com\jobportal\model\Application.java src\main\java\com\jobportal\model\User.java src\main\java\com\jobportal\service\DataStore.java src\main\java\com\jobportal\JobPortalServer.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed. Please ensure JDK 21+ is in your PATH.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Launching Java HTTP Server on http://localhost:8080 ...
start "" http://localhost:8080

java -cp bin com.jobportal.JobPortalServer 8080
pause
