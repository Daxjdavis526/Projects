@echo off
rem Double-click to start SPOTTER on Windows. Keep the window open while you use it.
title SPOTTER
cd /d "%~dp0"
rem Node.js just installed but not on this window's PATH yet: use its standard folder.
where node >nul 2>nul
if errorlevel 1 if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed yet.
  echo   Install the LTS version from https://nodejs.org, then double-click this file again.
  echo.
  pause
  exit /b 1
)
node scripts\launch.mjs
echo.
pause
