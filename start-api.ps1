# UrunBul Backend API Baslatici (Port 8000)
Write-Host "UrunBul Backend API Baslatiliyor (http://localhost:8000)..." -ForegroundColor Cyan

$ROOT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$API_DIR = Join-Path $ROOT_DIR "apps\api"
$PYTHON_EXE = Join-Path $ROOT_DIR ".venv\Scripts\python.exe"

# Port 8000 temizle
try {
    $lines = netstat -ano | Select-String ":8000\s"
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

$env:PYTHONPATH = "$API_DIR;$ROOT_DIR\packages"
& $PYTHON_EXE -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
