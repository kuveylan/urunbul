# UrunBul - Birlesik Baslatici (Tek Komutla Backend + Frontend)
# Kullanim: .\start.bat veya .\start.ps1

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "UrunBul - Pazar Istihbarat Platformu"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  UrunBul Platformu Baslatiliyor... (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ROOT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$PYTHON_EXE = Join-Path $ROOT_DIR ".venv\Scripts\python.exe"
$API_DIR = Join-Path $ROOT_DIR "apps\api"
$WEB_DIR = Join-Path $ROOT_DIR "apps\web"

if (-not (Test-Path $PYTHON_EXE)) {
    Write-Host "[HATA] Python sanal ortami bulunamadi: $PYTHON_EXE" -ForegroundColor Red
    Write-Host "Lutfen once sanal ortamin kurulu oldugundan emin olun." -ForegroundColor Yellow
    Read-Host "Kapatmak icin Enter'a basin..."
    exit 1
}

# 1. Port 8000 ve 3000 uzerindeki eski islemleri temizle
Write-Host "> Port kontrolleri yapiliyor (8000 & 3000)..." -ForegroundColor Yellow
$ports = @(8000, 3000)
foreach ($port in $ports) {
    try {
        $lines = netstat -ano | Select-String ":$port\s"
        foreach ($line in $lines) {
            $parts = ($line.ToString().Trim() -split '\s+')
            if ($parts.Count -ge 5) {
                $pidVal = $parts[-1]
                if ($pidVal -match '^\d+$' -and [int]$pidVal -gt 4) {
                    taskkill /F /PID $pidVal /T 2>$null | Out-Null
                }
            }
        }
    } catch {}
}
Start-Sleep -Seconds 1

# 2. Backend FastAPI Baslat (Port 8000)
Write-Host "> Backend API (FastAPI) baslatiliyor..." -ForegroundColor Green
$env:PYTHONPATH = "$API_DIR;$ROOT_DIR\packages"

$backendProcess = Start-Process -FilePath $PYTHON_EXE `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $API_DIR `
    -PassThru -WindowStyle Hidden

# Backend saglik kontrolu
$backendReady = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 700
    if ($backendProcess.HasExited) {
        Write-Host "[HATA] Backend islemi baslatilamadi veya beklenmedik sekilde kapandi!" -ForegroundColor Red
        break
    }
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 1 -ErrorAction Stop
        if ($res.status -eq "healthy") {
            $backendReady = $true
            break
        }
    } catch {}
}

if ($backendReady) {
    Write-Host "[OK] Backend API hazir! (http://localhost:8000/docs)" -ForegroundColor Green
} else {
    Write-Host "[UYARI] Backend gecikmeli yanit veriyor, arayuz baslatilmaya devam ediliyor..." -ForegroundColor Yellow
}

# 3. Frontend Next.js Baslat (Port 3000)
Write-Host "> Frontend (Next.js) baslatiliyor..." -ForegroundColor Green
Set-Location -Path $WEB_DIR

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  UrunBul Basariyla Calisiyor!" -ForegroundColor Cyan
Write-Host "  Web Arayuzu: http://localhost:3000" -ForegroundColor White
Write-Host "  API Dokumantasyonu: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  (Durdurmak icin bu pencerede CTRL+C yapabilirsiniz)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Tarayiciyi otomatik ac
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} | Out-Null

try {
    npm run dev
} catch {
    Write-Host "[HATA] Frontend baslatilirken sorun olustu: $_" -ForegroundColor Red
    Read-Host "Kapatmak icin Enter'a basin..."
} finally {
    Write-Host "Servisler kapatiliyor..." -ForegroundColor Yellow
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    foreach ($port in $ports) {
        try {
            $lines = netstat -ano | Select-String ":$port\s"
            foreach ($line in $lines) {
                $parts = ($line.ToString().Trim() -split '\s+')
                if ($parts.Count -ge 5) {
                    $pidVal = $parts[-1]
                    if ($pidVal -match '^\d+$' -and [int]$pidVal -gt 4) {
                        taskkill /F /PID $pidVal /T 2>$null | Out-Null
                    }
                }
            }
        } catch {}
    }
    Write-Host "[OK] Tum servisler durduruldu." -ForegroundColor Green
}
