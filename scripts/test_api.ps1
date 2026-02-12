# Test Hanko API Endpoint
Write-Host "Testing Hanko API Endpoint..."
Write-Host "=============================="

try {
    $body = '{"type":"personal"}'
    Write-Host "Sending POST to http://localhost:3001/api/hanko/create"
    Write-Host "Body: $body"
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/hanko/create" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    
    Write-Host ""
    Write-Host "SUCCESS!"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Status Description: $($response.StatusDescription)"
    Write-Host "Response Content:"
    Write-Host $response.Content
} catch {
    Write-Host ""
    Write-Host "FAILED!"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
