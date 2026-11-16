@echo off
title UrunBul - Web Frontend (Port 3000)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-web.ps1"
pause
