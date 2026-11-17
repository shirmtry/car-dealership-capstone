param([switch]$SkipDjango)
$ErrorActionPreference = 'Stop'
$capstoneRoot = Split-Path -Parent $PSScriptRoot
$capstoneLocal = Join-Path $capstoneRoot '.local'
$capstonePython = Join-Path $capstoneRoot '.venv/Scripts/python.exe'
$capstoneNode = (Get-Command node.exe).Source
New-Item -ItemType Directory -Path $capstoneLocal -Force | Out-Null
$capstoneServices = @(
    @{Name='backend';Port=3030;File=$capstoneNode;Args='app.js';Dir='server/database';Health='/health'},
    @{Name='sentiment';Port=5050;File=$capstonePython;Args='-u app.py';Dir='server/djangoapp/microservices';Health='/health'}
)
if (-not $SkipDjango) {
    $capstoneServices += @{Name='django';Port=8000;File=$capstonePython;Args='-u scripts/dev_server.py';Dir='.';Health='/djangoapp/session'}
}
$capstoneRecords = @()
foreach ($capstoneService in $capstoneServices) {
    $capstoneListener = Get-NetTCPConnection -LocalPort $capstoneService.Port -State Listen -ErrorAction SilentlyContinue
    if ($capstoneListener) {
        throw "Port $($capstoneService.Port) is occupied. Inspect its process before restarting."
    }
    $capstoneProcess = Start-Process -FilePath $capstoneService.File -ArgumentList $capstoneService.Args -WorkingDirectory (Join-Path $capstoneRoot $capstoneService.Dir) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $capstoneLocal "$($capstoneService.Name).out.log") -RedirectStandardError (Join-Path $capstoneLocal "$($capstoneService.Name).err.log") -PassThru
    $capstoneRecords += @{Name=$capstoneService.Name;Pid=$capstoneProcess.Id;Port=$capstoneService.Port}
    $capstoneReady = $false
    for ($capstoneAttempt=0; $capstoneAttempt -lt 40; $capstoneAttempt++) {
        try {
            $capstoneResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$($capstoneService.Port)$($capstoneService.Health)" -TimeoutSec 2
            if ($capstoneResponse.StatusCode -eq 200) { $capstoneReady = $true; break }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $capstoneReady) { throw "$($capstoneService.Name) failed to start. Read .local service logs." }
    Write-Output "$($capstoneService.Name) running on port $($capstoneService.Port), PID $($capstoneProcess.Id)"
}
$capstoneRecords | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $capstoneLocal 'services.json') -Encoding utf8
