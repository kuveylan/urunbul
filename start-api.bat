@echo off
title UrunBul - Backend API (Port 8000)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-api.ps1"
pause
