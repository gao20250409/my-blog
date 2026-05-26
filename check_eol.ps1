$bytes = [System.IO.File]::ReadAllBytes('d:\gx\root\my-blog\src\pages\index.astro')
$crlfCount = 0
for ($i = 0; $i -lt $bytes.Length - 1; $i++) {
    if ($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10) { $crlfCount++ }
}
$lfCount = ($bytes | Where-Object { $_ -eq 10 }).Count
Write-Output "CRLF: $crlfCount"
Write-Output "Total LF: $lfCount"
Write-Output "File length: $($bytes.Length)"
