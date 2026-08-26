@echo off
title HORIZON - Observable Universe Explorer
cd /d "%~dp0"
echo Starting HORIZON... your browser will open in a moment.
echo (Keep this black window open while you explore. Close it when done.)
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8123"
py -m http.server 8123 2>nul
if errorlevel 1 python -m http.server 8123
if errorlevel 1 (
  echo.
  echo Python was not found. Install it free from the Microsoft Store:
  echo   1. Open the Microsoft Store app
  echo   2. Search for "Python 3.12" and click Get
  echo   3. Then double-click this file again
  pause
)
