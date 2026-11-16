@echo off
@chcp 65001 >nul
title UrunBul - Platform Baslatici
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if %errorlevel% neq 0 (
    echo.
    echo ==========================================================
    echo [HATA] Bir sorun nedeniyle uygulama sonlandi.
    echo ==========================================================
    pause
)
