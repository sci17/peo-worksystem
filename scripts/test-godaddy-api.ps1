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

if ($Domain -match '^(yourdomain\.com|example\.com|example\.org)$') {
    Write-Host "GoDaddy API check skipped."
    Write-Host "The domain argument is still a placeholder: $Domain"
    Write-Host "Run the command again with your real GoDaddy domain."
    exit 1
}

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
    $statusCode = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }

    Write-Host "GoDaddy API check failed against: $apiUrl"
    Write-Host $message
    Write-Host ""

    if ($statusCode -eq 404) {
        Write-Host "A 404 here usually means one of these:"
        Write-Host "1. The domain name passed to the script is wrong or still a placeholder."
        Write-Host "2. The domain is not in the same GoDaddy account as this API key."
        Write-Host "3. The API base URL does not match the key environment."
        Write-Host ""
    }

    Write-Host "For a live Production key, use:"
    Write-Host "dns_godaddy_api_url = https://api.godaddy.com"
    Write-Host ""
    Write-Host "Only for OTE/test keys, use:"
    Write-Host "dns_godaddy_api_url = https://api.ote-godaddy.com"
    exit 1
}
