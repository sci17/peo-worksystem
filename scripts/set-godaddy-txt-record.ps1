param(
    [Parameter(Mandatory = $true)]
    [string]$RecordName,

    [Parameter(Mandatory = $true)]
    [string]$RecordValue,

    [string]$Domain = "peopalawan.com",
    [int]$Ttl = 600,
    [string]$CredentialsPath = "C:\Users\Administrator\Desktop\peo-worksystem\secrets\godaddy.ini"
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
    "Content-Type" = "application/json"
}

$body = @(
    @{
        data = $RecordValue
        ttl = $Ttl
    }
) | ConvertTo-Json

Invoke-RestMethod -Uri "$apiUrl/v1/domains/$Domain/records/TXT/$RecordName" -Headers $headers -Method Put -Body $body | Out-Null

Write-Host "TXT record updated:"
Write-Host "  Domain: $Domain"
Write-Host "  Name:   $RecordName"
Write-Host "  Value:  $RecordValue"
Write-Host "  TTL:    $Ttl"
