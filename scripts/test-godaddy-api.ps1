param(
    [string]$CredentialsPath = "C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini",
    [string]$Domain = "peopalawan.com"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $CredentialsPath)) {
    throw "Missing credentials file: $CredentialsPath"
}

$settings = @{}
Get-Content -LiteralPath $CredentialsPath | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$") {
        $settings[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$key = $settings["dns_godaddy_key"]
$secret = $settings["dns_godaddy_secret"]
$apiUrl = $settings["dns_godaddy_api_url"]

if (-not $key -or -not $secret) {
    throw "Credentials file must contain dns_godaddy_key and dns_godaddy_secret."
}

if (-not $apiUrl) {
    $apiUrl = "https://api.godaddy.com"
}

$headers = @{
    Authorization = "sso-key $key`:$secret"
    Accept = "application/json"
}

$url = "$apiUrl/v1/domains/$Domain"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "GoDaddy API OK: $apiUrl"
    if ($response.domain) {
        Write-Host "Domain found: $($response.domain)"
    } else {
        Write-Host "Domain lookup succeeded."
    }
    exit 0
} catch {
    $message = $_.Exception.Message
    Write-Host "GoDaddy API check failed against: $apiUrl"
    Write-Host $message
    Write-Host ""
    Write-Host "If this is a test or OTE key, set:"
    Write-Host "dns_godaddy_api_url = https://api.production-godaddy.com"
    Write-Host ""
    Write-Host "If this domain is your live GoDaddy domain, you usually need a Live/Production API key."
    exit 1
}
