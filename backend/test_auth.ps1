$ErrorActionPreference = "Stop"
$body = @{
    client_id = "api-prod"
    grant_type = "password"
    username = "cpf-02-0860-0363@comprobanteselectronicos.go.cr"
    password = '$*@sz7RU^_1T^wQcu90A'
}
try {
    $response = Invoke-RestMethod -Method Post -Uri "https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token" -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Output "SUCCESS"
    Write-Output $response
} catch {
    Write-Output "FAILED"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
