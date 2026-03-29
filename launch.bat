@echo off
title PCY Question Engine — Launcher

echo.
echo  Starting PCY Question Engine...
echo.

:: Start Python HTTP server in the background
echo  [1/2] Starting local server on http://localhost:3000...
start "" cmd /c "cd /d %~dp0 && python -m http.server 3000"
timeout /t 2 /nobreak >NUL

:: Open the browser
echo  [2/2] Opening browser...
start "" http://localhost:3000

echo.
echo  PCY Question Engine is running at http://localhost:3000
echo  AI Assistant powered by Google Gemini 2.0 Flash.
echo  Close this window to stop the server.
echo.
pause
