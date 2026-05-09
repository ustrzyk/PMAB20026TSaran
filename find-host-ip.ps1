# find-host-ip.ps1
# Skrypt pomocniczy do znalezienia IP komputera
# Przydatny przy laczeniu React Native z API uruchomionym w Dockerze

$apiPort = 5000
$testEndpoint = "api/Item"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " PMAB20026TSaran - konfiguracja API" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Pobranie najlepszego lokalnego adresu IPv4
# Pomijamy localhost, adresy awaryjne 169.254 oraz adresy WSL/Docker
$bestIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notmatch '^(127\.|169\.254\.|172\.)' -and
        $_.InterfaceAlias -notmatch 'WSL|Docker|Loopback|vEthernet' -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1).IPAddress

if (-not $bestIP) {
    Write-Host "Nie znaleziono glownego adresu IPv4." -ForegroundColor Red
    Write-Host "Sprobuj sprawdzic recznie komenda: ipconfig" -ForegroundColor Yellow
    exit 1
}

Write-Host "Twoje IP komputera: $bestIP" -ForegroundColor Green
Write-Host ""

Write-Host "Adres API na tym komputerze:" -ForegroundColor Yellow
Write-Host "  http://localhost:$apiPort/api" -ForegroundColor White
Write-Host ""

Write-Host "Swagger:" -ForegroundColor Yellow
Write-Host "  http://localhost:$apiPort/swagger/index.html" -ForegroundColor White
Write-Host ""

Write-Host "Dla emulatora Android uzyj w React Native:" -ForegroundColor Yellow
Write-Host "  http://10.0.2.2:$apiPort/api" -ForegroundColor White
Write-Host ""

Write-Host "Dla fizycznego telefonu w tej samej sieci Wi-Fi/LAN uzyj:" -ForegroundColor Yellow
Write-Host "  http://${bestIP}:$apiPort/api" -ForegroundColor White
Write-Host ""

Write-Host "Przyklad config.ts dla emulatora Android:" -ForegroundColor Yellow
Write-Host "  export const API_BASE_URL = 'http://10.0.2.2:$apiPort/api';" -ForegroundColor White
Write-Host ""

Write-Host "Przyklad config.ts dla telefonu fizycznego:" -ForegroundColor Yellow
Write-Host "  export const API_BASE_URL = 'http://${bestIP}:$apiPort/api';" -ForegroundColor White
Write-Host ""

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Test polaczenia z API" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Test localhost
$localhostUrl = "http://localhost:$apiPort/$testEndpoint"

try {
    Write-Host "Test localhost:" -ForegroundColor Yellow
    Write-Host "  $localhostUrl" -ForegroundColor White

    $response = Invoke-WebRequest -Uri $localhostUrl -TimeoutSec 5

    Write-Host "OK - API odpowiada przez localhost. Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "BLAD - API nie odpowiada przez localhost." -ForegroundColor Red
    Write-Host "Sprawdz, czy Docker/API dziala:" -ForegroundColor Yellow
    Write-Host "  docker compose ps" -ForegroundColor White
    Write-Host "  docker compose logs -f api" -ForegroundColor White
}

Write-Host ""

# Test po IP sieciowym
$networkUrl = "http://${bestIP}:$apiPort/$testEndpoint"

try {
    Write-Host "Test IP sieciowego:" -ForegroundColor Yellow
    Write-Host "  $networkUrl" -ForegroundColor White

    $response = Invoke-WebRequest -Uri $networkUrl -TimeoutSec 5

    Write-Host "OK - API odpowiada przez IP sieciowe. Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "BLAD - API nie odpowiada przez IP sieciowe." -ForegroundColor Red
    Write-Host "Mozliwe przyczyny:" -ForegroundColor Yellow
    Write-Host "  - API/Docker nie jest uruchomione"
    Write-Host "  - firewall blokuje port $apiPort"
    Write-Host "  - API nie nasluchuje na 0.0.0.0"
    Write-Host "  - kontener API nie wystartowal poprawnie"
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Pomocnicze komendy" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Uruchomienie API + SQL Server:" -ForegroundColor Yellow
Write-Host "  docker compose up -d --build" -ForegroundColor White
Write-Host ""

Write-Host "Status kontenerow:" -ForegroundColor Yellow
Write-Host "  docker compose ps" -ForegroundColor White
Write-Host ""

Write-Host "Logi API:" -ForegroundColor Yellow
Write-Host "  docker compose logs -f api" -ForegroundColor White
Write-Host ""

Write-Host "Endpoint testowy:" -ForegroundColor Yellow
Write-Host "  http://localhost:$apiPort/$testEndpoint" -ForegroundColor White
Write-Host ""