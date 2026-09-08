@echo off
title PRIMEVAL - Thera Survey
cd /d "%~dp0"
echo Starting PRIMEVAL... your browser will open in a moment.
echo (Keep this black window open while you play. Close it when done.)
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8124"
py -m http.server 8124 2>nul
if errorlevel 1 python -m http.server 8124
if errorlevel 1 (
  echo.
  echo Python was not found. Install it free from the Microsoft Store:
  echo   1. Open the Microsoft Store app
  echo   2. Search for "Python 3.12" and click Get
  echo   3. Then double-click this file again
  pause
)
