# UrunBul Web Frontend Baslatici (Port 3000)
Write-Host "UrunBul Web Frontend Baslatiliyor (http://localhost:3000)..." -ForegroundColor Green

$ROOT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$WEB_DIR = Join-Path $ROOT_DIR "apps\web"

# Port 3000 temizle
try {
    $lines = netstat -ano | Select-String ":3000\s"
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

Set-Location -Path $WEB_DIR
npm run dev
